import { MEMBER_FIELDS, USER_FIELDS } from '@/constants/google';
import { googleUser, googleGroupMember } from 'test/fixtures/auth/google/admin';
import { admin_directory_v1 } from 'googleapis';
import { GoogleAdminService } from './google-admin.service';

describe('GoogleAdminService', () => {
  const mockDirectory = <admin_directory_v1.Admin><unknown>{
    users: {
      get: jest.fn(),
    },
    members: { get: jest.fn() },
  };

  const service: GoogleAdminService = new GoogleAdminService(mockDirectory);

  describe('getUser(userKey)', () => {
    it('gets valid user', async () => {
      (mockDirectory.users.get as jest.Mock).mockResolvedValue({ data: googleUser });

      const user = await service.getUser(googleUser.primaryEmail);

      expect(user).toStrictEqual(googleUser);
      expect(mockDirectory.users.get).toBeCalledTimes(1);
      expect(mockDirectory.users.get).toBeCalledWith({
        userKey: googleUser.primaryEmail,
        fields: USER_FIELDS.join(','),
      });
    });

    it('returns null if there was an error thrown', async () => {
      (mockDirectory.users.get as jest.Mock).mockRejectedValue(new Error('does not exist'));

      const user = await service.getUser(googleUser.primaryEmail);

      expect(user).toBeNull();
      expect(mockDirectory.users.get).toBeCalledTimes(1);
      expect(mockDirectory.users.get).toBeCalledWith({
        userKey: googleUser.primaryEmail,
        fields: USER_FIELDS.join(','),
      });
    });
  });

  describe('getPhoto(userKey)', () => {
    it('gets valid photo', async () => {
      (mockDirectory.users.get as jest.Mock).mockResolvedValue({ data: googleUser });

      const photo = await service.getPhoto(googleUser.primaryEmail);

      expect(photo).toEqual(googleUser.thumbnailPhotoUrl);
      expect(mockDirectory.users.get).toBeCalledTimes(1);
      expect(mockDirectory.users.get).toBeCalledWith({
        userKey: googleUser.primaryEmail,
        fields: USER_FIELDS.join(','),
      });
    });

    it('returns null if there was an error thrown', async () => {
      (mockDirectory.users.get as jest.Mock).mockRejectedValue(new Error('does not exist'));

      const photo = await service.getPhoto(googleUser.primaryEmail);

      expect(photo).toBeNull();
      expect(mockDirectory.users.get).toBeCalledTimes(1);
      expect(mockDirectory.users.get).toBeCalledWith({
        userKey: googleUser.primaryEmail,
        fields: USER_FIELDS.join(','),
      });
    });

    it('returns null if thumbnailPhotoUrl is null', async () => {
      (mockDirectory.users.get as jest.Mock).mockResolvedValue({ data: { thumbnailPhotoUrl: null } });

      const photo = await service.getPhoto(googleUser.primaryEmail);

      expect(photo).toBeNull();
      expect(mockDirectory.users.get).toBeCalledTimes(1);
      expect(mockDirectory.users.get).toBeCalledWith({
        userKey: googleUser.primaryEmail,
        fields: USER_FIELDS.join(','),
      });
    });
  });

  describe('isActiveMember(memberKey, groupKey)', () => {
    const groupKey = 'group@rtx.com';

    it('returns false if there is no data from the response', async () => {
      (mockDirectory.members.get as jest.Mock).mockResolvedValue({ data: null });

      const active = await service.isActiveMember(googleUser.primaryEmail, groupKey);

      expect(active).toBeFalse();
      expect(mockDirectory.members.get).toBeCalledTimes(1);
      expect(mockDirectory.members.get).toBeCalledWith({
        groupKey,
        memberKey: googleUser.primaryEmail,
        fields: MEMBER_FIELDS.join(','),
      });
    });

    it('returns false if member is not active', async () => {
      const notActive = { ...googleGroupMember, status: 'NOT_ACTIVE' };
      (mockDirectory.members.get as jest.Mock).mockResolvedValue({ data: notActive });

      const active = await service.isActiveMember(googleUser.primaryEmail, groupKey);

      expect(active).toBeFalse();
      expect(mockDirectory.members.get).toBeCalledTimes(1);
      expect(mockDirectory.members.get).toBeCalledWith({
        groupKey,
        memberKey: googleUser.primaryEmail,
        fields: MEMBER_FIELDS.join(','),
      });
    });

    it('returns false if there was an error thrown', async () => {
      (mockDirectory.members.get as jest.Mock).mockRejectedValue(new Error('not exist'));

      const active = await service.isActiveMember(googleUser.primaryEmail, groupKey);

      expect(active).toBeFalse();
      expect(mockDirectory.members.get).toBeCalledTimes(1);
      expect(mockDirectory.members.get).toBeCalledWith({
        groupKey,
        memberKey: googleUser.primaryEmail,
        fields: MEMBER_FIELDS.join(','),
      });
    });

    it('returns true user is active', async () => {
      (mockDirectory.members.get as jest.Mock).mockResolvedValue({ data: googleGroupMember });

      const active = await service.isActiveMember(googleUser.primaryEmail, groupKey);

      expect(active).toBeTrue();
      expect(mockDirectory.members.get).toBeCalledTimes(1);
      expect(mockDirectory.members.get).toBeCalledWith({
        groupKey,
        memberKey: googleUser.primaryEmail,
        fields: MEMBER_FIELDS.join(','),
      });
    });
  });
});
