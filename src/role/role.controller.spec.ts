import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@/core/exceptions';
import { AuthUserData } from '@/auth/auth.interface';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { Role } from './role.entity';
import { UpdateRoleDto } from './dto/update-role.dto';
import { CreateRoleDto } from './dto/create-role.dto';

describe('RoleController', () => {
  let controller: RoleController;

  const mockRoleService = {
    all: jest.fn(),
    getByName: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const adminRole = {
    id: 1,
    name: 'super admin',
    description: 'super admin roleeeee',
    level: 0,
  };

  const userRole = {
    id: 11,
    name: 'user',
    description: 'user roleeeee',
    level: 10,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        { provide: RoleService, useValue: mockRoleService },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index(request)', () => {
    const user = <AuthUserData>{
      id: 'uuid-hash',
      role: { level: 0 },
      isSuperAdmin: true,
    };

    const defaultPagination = {
      current: 1,
      size: 15,
    };

    beforeEach(() => {
      mockRoleService.all.mockResolvedValue({
        rows: [adminRole],
        count: 10,
      });
    });

    describe('pagination', () => {
      it('paginates list', async () => {
        const query = {
          page: 1,
          pageSize: 2,
        };

        const result = await controller.index({ query, user });

        expect(result).toStrictEqual({
          data: [adminRole],
          pagination: {
            current: query.page,
            size: query.pageSize,
            total: 10,
          },
        });

        expect(mockRoleService.all).toBeCalledTimes(1);
        expect(mockRoleService.all).toBeCalledWith({
          filters: { minLevel: user.role.level },
          page: {
            current: query.page,
            size: query.pageSize,
          },
        });
      });

      it('has default pagination if not found from query', async () => {
        const result = await controller.index({ query: {}, user });

        expect(result).toStrictEqual({
          data: [adminRole],
          pagination: {
            ...defaultPagination,
            total: 10,
          },
        });

        expect(mockRoleService.all).toBeCalledTimes(1);
        expect(mockRoleService.all).toBeCalledWith({
          filters: { minLevel: user.role.level },
          page: defaultPagination,
        });
      });

      it('ignores default pagination if "infinite" was requested from query', async () => {
        mockRoleService.all.mockResolvedValue([adminRole]);

        const result = await controller.index({
          query: { infinite: true },
          user,
        });

        expect(result).toStrictEqual([adminRole]);

        expect(mockRoleService.all).toBeCalledTimes(1);
        expect(mockRoleService.all).toBeCalledWith({
          filters: { minLevel: user.role.level },
        });
      });
    });

    describe('filters', () => {
      const query = {
        query: adminRole.name,
        invalid: 'invalidddddddddd!',
      };

      it('accepts filters', async () => {
        const result = await controller.index({ query, user });

        expect(result).toHaveProperty('data');

        expect(mockRoleService.all).toBeCalledTimes(1);
        expect(mockRoleService.all).toBeCalledWith({
          page: defaultPagination,
          filters: {
            query: query.query,
            minLevel: user.role.level,
          },
        });
      });
    });
  });

  describe('show(id)', () => {
    it('returns a role with the given id', async () => {
      mockRoleService.getById.mockResolvedValue(adminRole);

      const data = await controller.show(adminRole.id);

      expect(data).toStrictEqual(adminRole);

      expect(mockRoleService.getById).toBeCalledTimes(1);
      expect(mockRoleService.getById).toBeCalledWith(adminRole.id);
    });
  });

  describe('store(request)', () => {
    const body = <CreateRoleDto>{
      name: 'super admin',
      description: 'super admin roleeeee',
    };

    it('throws bad request exception if name already exists', async () => {
      mockRoleService.getByName.mockResolvedValue(adminRole);

      expect.assertions(4);

      try {
        await controller.store(body);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(`Role with name ${body.name} already exists`);
        expect(error.code).toBe('create_role_validation');

        expect(mockRoleService.create).not.toBeCalled();
      }
    });

    it('creates new role', async () => {
      mockRoleService.getByName.mockResolvedValue(null);

      const created = <Role>{ ...body, id: 1 };

      mockRoleService.create.mockResolvedValue(created);

      await controller.store(body);

      expect(mockRoleService.create).toBeCalledTimes(1);
      expect(mockRoleService.create).toBeCalledWith(body);
    });

    it('converts name to lowercase before creating', async () => {
      const randomCase = <CreateRoleDto>{ name: 'SuPeR AdMin' };

      await controller.store(randomCase);

      expect(mockRoleService.create).toBeCalledTimes(1);
      expect(mockRoleService.create).toBeCalledWith({ name: 'super admin' });
    });
  });

  describe('update(id)', () => {
    const body = <UpdateRoleDto>{
      name: 'admin',
      description: 'demoted admin roleeeee',
    };

    beforeEach(() => {
      mockRoleService.getById.mockResolvedValue(userRole);
    });

    it('throws bad request exception if role does not exist', async () => {
      mockRoleService.getById.mockResolvedValue(null);

      expect.assertions(5);

      try {
        await controller.update(adminRole.id, body);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Role record does not exist');
        expect(error.code).toBe('update_role_validation');

        expect(mockRoleService.getByName).not.toBeCalled();
        expect(mockRoleService.update).not.toBeCalled();
      }
    });

    it('throws forbidden exception if role that is being updated is super admin', async () => {
      mockRoleService.getById.mockResolvedValue(adminRole);

      expect.assertions(4);

      try {
        await controller.update(adminRole.id, body);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('Super admin role can not be modified');
        expect(error.code).toBe('update_role_validation');

        expect(mockRoleService.update).not.toBeCalled();
      }
    });

    it('throws bad request exception if name is already used by a different role', async () => {
      const existing = { ...adminRole, name: body.name };

      mockRoleService.getByName.mockResolvedValue(existing);

      expect.assertions(4);

      try {
        await controller.update(adminRole.id, body);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe(`Role with name ${body.name} already exists`);
        expect(error.code).toBe('update_role_validation');

        expect(mockRoleService.update).not.toBeCalled();
      }
    });

    it('updates record with an existing name that belongs to the role being updated', async () => {
      mockRoleService.getByName.mockResolvedValue(userRole);

      const sameNamePayload = { ...body, name: userRole.name };

      await controller.update(userRole.id, sameNamePayload);

      expect(mockRoleService.getById).toBeCalledTimes(1);
      expect(mockRoleService.getById).toBeCalledWith(userRole.id);

      expect(mockRoleService.getByName).not.toBeCalled();

      expect(mockRoleService.update).toBeCalledTimes(1);
      expect(mockRoleService.update).toBeCalledWith(userRole, sameNamePayload);
    });

    it('updates role with new name that is not in db', async () => {
      mockRoleService.getByName.mockResolvedValue(null);

      await controller.update(userRole.id, body);

      expect(mockRoleService.getById).toBeCalledTimes(1);
      expect(mockRoleService.getById).toBeCalledWith(userRole.id);

      expect(mockRoleService.getByName).toBeCalledTimes(1);
      expect(mockRoleService.getByName).toBeCalledWith(body.name);

      expect(mockRoleService.update).toBeCalledTimes(1);
      expect(mockRoleService.update).toBeCalledWith(userRole, body);
    });
  });

  describe('delete(id)', () => {
    it('throws bad request exception if role does not exist', async () => {
      mockRoleService.getById.mockResolvedValue(null);

      expect.assertions(4);

      try {
        await controller.destroy(adminRole.id);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Role record does not exist');
        expect(error.code).toBe('delete_role_validation');

        expect(mockRoleService.delete).not.toBeCalled();
      }
    });

    it('throws forbidden exception if role that is being deleted is super admin', async () => {
      mockRoleService.getById.mockResolvedValue(adminRole);

      expect.assertions(4);

      try {
        await controller.destroy(adminRole.id);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toBe('Super admin role can not be modified');
        expect(error.code).toBe('delete_role_validation');

        expect(mockRoleService.delete).not.toBeCalled();
      }
    });

    it('deletes an existing role', async () => {
      mockRoleService.getById.mockResolvedValue(userRole);

      await controller.destroy(userRole.id);

      expect(mockRoleService.getById).toBeCalledTimes(1);
      expect(mockRoleService.getById).toBeCalledWith(userRole.id);

      expect(mockRoleService.delete).toBeCalledTimes(1);
      expect(mockRoleService.delete).toBeCalledWith(userRole);
    });
  });
});
