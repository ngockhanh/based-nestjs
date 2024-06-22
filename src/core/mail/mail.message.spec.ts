import * as fs from 'fs';
import * as ejs from 'ejs';
import mailConfig from '@/configs/mail.config';
import { Message } from './mail.message';

jest.mock('fs', () => ({ readFileSync: jest.fn() }));
jest.mock('ejs');

ejs.render = jest.fn();

describe('mail Message tests', () => {
  const data = { some: 'data' };

  it('generates json representation of the Message', () => {
    const message = new Message('subject', data);
    const sender = {
      email: 'from@test.com',
      name: 'From Name',
    };
    const meta = { meta: 'data' };
    const tags = ['tag-1'];
    const to = 'user@test.com';
    const view = 'some view';

    message.from(sender.email, sender.name);
    message.setMetadata(meta);
    message.setTags(tags);
    message.to(to);
    message.setView(view);

    const json = message.json();

    expect(json).toHaveProperty('subject', 'subject');
    expect(json).toHaveProperty('inline_css', true);
    expect(json).toHaveProperty('from_email', sender.email);
    expect(json).toHaveProperty('from_name', sender.name);
    expect(json).toHaveProperty('metadata', meta);
    expect(json).toHaveProperty('tags', tags);
    expect(json).toHaveProperty('to', [{ email: to, type: 'to' }]);
    expect(json).toHaveProperty('html', view);
    expect(json).toHaveProperty('attachments', null); // default
    expect(json).toHaveProperty('subaccount', mailConfig().mailchimp.account);
  });

  it('sets view by template', () => {
    const pathToTemplate = '/an/absolute/path/to/a-template';
    const fileString = 'A buffer that contains rendered file with data';
    const rendered = '<h1>A rendered template</h1>';

    // mock returns
    (fs.readFileSync as jest.Mock).mockReturnValue(fileString);
    (ejs.render as jest.Mock).mockReturnValue(rendered);

    const message = new Message('subject', data);
    message.setViewFromTemplate(pathToTemplate);

    expect(fs.readFileSync).toBeCalledWith(pathToTemplate, 'utf-8');
    expect(ejs.render).toBeCalledWith(fileString, data, { filename: pathToTemplate });

    const json = message.json();
    expect(json.html).toEqual(rendered);
  });

  it('sets the view with raw string', () => {
    const rendered = '<h1>A rendered template</h1>';
    // mocks
    (ejs.render as jest.Mock).mockReturnValue(rendered);

    const message = new Message('subject', data);
    const rawView = 'A raw view';
    message.setViewRaw(rawView);

    expect(ejs.render).toBeCalledWith(rawView, data);

    const json = message.json();
    expect(json.html).toEqual(rendered);
  });

  it('sets tags', () => {
    const message = new Message('sub', data);
    const tags = ['tag-1', 'tag-2'];

    message.setTags(tags);

    const json = message.json();

    expect(json.tags).toEqual(tags);
  });

  it('sets sender', () => {
    const message = new Message('sub', data);

    message.from('emo666@gmail.com', 'Emo not Dead xd');

    const json = message.json();

    expect(json).toHaveProperty('from_email', 'emo666@gmail.com');
    expect(json).toHaveProperty('from_name', 'Emo not Dead xd');
  });

  it('sets metadata', () => {
    const message = new Message('sub', data);
    const meta = { meta: 'data' };

    message.setMetadata(meta);

    const json = message.json();

    expect(json.metadata).toEqual(meta);
  });

  it('adds recipient to addresses', () => {
    const message = new Message('sub', data);

    message.to('email1@test.com');
    message.to('email2@test.com', 'name-2');

    const json = message.json();

    expect(json.to).toContainObject({
      email: 'email1@test.com',
      type: 'to',
    });
    expect(json.to).toContainObject({
      email: 'email2@test.com',
      name: 'name-2',
      type: 'to',
    });
  });
});
