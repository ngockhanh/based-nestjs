import { Auth, google } from 'googleapis';
import googleConfig from '@/configs/google.config';
import { ADMIN_SCOPES } from '@/constants/google';
import { GoogleAdminService } from './google-admin.service';

export const GoogleAdminProvider = {
  provide: GoogleAdminService,
  useFactory: async () => {
    const config = googleConfig();
    const auth = new Auth.GoogleAuth({
      keyFile: config.keyPath,
      projectId: config.projectId,
      scopes: ADMIN_SCOPES,
    });

    const client = await auth.getClient() as any;
    const directory = google.admin({
      version: 'directory_v1',
      auth: client,
    });

    return new GoogleAdminService(directory);
  },
};
