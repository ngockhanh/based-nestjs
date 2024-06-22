import * as fs from 'fs';
import * as ejs from 'ejs';
import mailConfig from '@/configs/mail.config';

type Sender = {
  email: string,
  name: string,
};

type Address = {
  email: string,
  name: string,
  type: string,
};

export class Message {
  /**
   * @protected
   * @type {Sender}
   */
  protected sender: Sender;

  /**
   * @protected
   * @type {string}
   */
  protected view: string = '';

  /**
   * @protected
   * @type {object}
   */
  protected viewData: object = {};

  /**
   * @protected
   * @type {string}
   */
  protected subject: string = '';

  /**
   * @protected
   * @type {string[]}
   */
  protected tags: string[] = [];

  /**
   * @protected
   * @type {Address[]}
   */
  protected addresses: Address[] = [];

  /**
   * @protected
   * @type {object}
   */
  protected metadata: object = {};

  /**
   * @protected
   * @type {(null | any[])}
   */
  protected attachments: null | any[] = null;

  /**
   * @protected
   * @type {string}
   */
  protected account: string;

  /**
   * Creates an instance of Message.
   *
   * @param {string} [subject='']
   * @param {object} [viewData={}]
   */
  constructor(subject: string = '', viewData: object = {}) {
    const { from, mailchimp } = mailConfig();

    this.account = mailchimp.account;

    this.sender = {
      email: from.email,
      name: from.name,
    };

    this.viewData = viewData;
    this.subject = subject;
  }

  /**
   * Add email and name to current this.addresses.
   *
   * @param {string} email
   * @param {string|null} [name=null]
   *
   * @returns {Message}
   */
  public to(email: string, name: string | null = null): Message {
    const address = <Address>{ email, type: 'to' };

    if (name) {
      address.name = name;
    }

    this.addresses.push(address);

    return this;
  }

  /**
   * Getter for this.addresses.
   *
   * @return {Address[]}
   */
  public getAddresses(): Address[] {
    return this.addresses;
  }

  /**
   * Set sender.
   *
   * @param {string} email
   * @param {string} [name='']
   *
   * @return {Message}
   */
  public from(email: string, name: string = ''): Message {
    this.sender.email = email;
    this.sender.name = name;

    return this;
  }

  /**
   * Set the view from a rendered template file.
   *
   * @param {string} templatePath
   *
   * @returns {Message}
   */
  public setViewFromTemplate(templatePath: string): Message {
    const view = ejs.render(
      fs.readFileSync(templatePath, 'utf-8'),
      this.viewData,
      { filename: templatePath },
    );

    return this.setView(view);
  }

  /**
   * Set the view with raw string and viewData.
   *
   * @param {string} plain
   *
   * @returns {Message}
   */
  public setViewRaw(plain: string): Message {
    const view = ejs.render(plain, this.viewData);

    return this.setView(view);
  }

  /**
   * this.view setter.
   *
   * @param {string} view
   *
   * @returns {Message}
   */
  public setView(view: string): Message {
    this.view = view;

    return this;
  }

  /**
   * this.tags setter.
   *
   * @param {string[]} [tags=[]]
   *
   * @returns {Message}
   */
  public setTags(tags: string[] = []): Message {
    this.tags = tags;

    return this;
  }

  /**
   * this.metadata setter.
   *
   * @param {object} [metadata={}]
   *
   * @returns {Message}
   */
  public setMetadata(metadata: object = {}): Message {
    this.metadata = metadata;

    return this;
  }

  /**
   * Arrange the current Message object to json.
   *
   * @returns {{ [key: string] : any }}
   */
  public json(): { [key: string] : any } {
    return {
      inline_css: true,
      subject: this.subject,
      from_email: this.sender.email,
      from_name: this.sender.name,
      metadata: this.metadata,
      tags: this.tags,
      to: this.addresses,
      html: this.view,
      attachments: this.attachments,
      subaccount: this.account,
    };
  }
}
