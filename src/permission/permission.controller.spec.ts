import { Test, TestingModule } from '@nestjs/testing';
import { PermissionController } from './permission.controller';
import { PermissionService } from './permission.service';
import { ManagePermissionsDto } from './dto/manage-permissions.dto';

describe('PermissionController', () => {
  let controller: PermissionController;

  const mockPermissionService = {
    manage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionController],
      providers: [
        { provide: PermissionService, useValue: mockPermissionService },
      ],
    }).compile();

    controller = module.get<PermissionController>(PermissionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call api to update role permissions', async () => {
    const body: ManagePermissionsDto = {
      data: [
        {
          roleId: 1,
          permissions: [1, 2, 3],
        },
      ],
    };
    const result = await controller.manage(body);
    expect(mockPermissionService.manage).toHaveBeenCalledTimes(1);
    expect(mockPermissionService.manage).toHaveBeenLastCalledWith(body.data);
    expect(result).toBeDefined();
    expect(result).toEqual({ success: true });
  });
});
