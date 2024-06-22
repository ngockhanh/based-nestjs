import { Module } from '@nestjs/common';
import * as Mailchimp from '@mailchimp/mailchimp_transactional';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailchimpMailer } from './mail.mailchimp-mailer';
import { Mailer } from './mail.interface';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: Mailer,
      useFactory: async (configService: ConfigService) => new MailchimpMailer(
        Mailchimp(configService.get<string>('MAILCHIMP_API_KEY')),
      ),
      inject: [ConfigService],
    },
  ],
  exports: [Mailer],
})
export class MailModule {}
