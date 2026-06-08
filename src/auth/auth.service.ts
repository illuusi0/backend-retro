import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import { User } from '../database/models/user.model';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { GuestDto } from './dto/guest.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User) private readonly userModel: typeof User,
    private readonly jwt: JwtService,
  ) {}

  private sign(user: User) {
    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
      email: user.email,
    };
    return this.jwt.sign(payload);
  }

  private serialize(user: User) {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.userModel.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.userModel.create({
      email: dto.email,
      username: dto.username,
      passwordHash,
      role: dto.role === 'member' ? 'member' : 'facilitator',
    } as any);

    return { token: this.sign(user), user: this.serialize(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ where: { email: dto.email } });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { token: this.sign(user), user: this.serialize(user) };
  }

  async guest(dto: GuestDto) {
    const guestToken = nanoid(24);
    const user = await this.userModel.create({
      username: dto.username,
      role: 'guest',
      guestToken,
    } as any);

    return {
      token: this.sign(user),
      guestToken,
      user: this.serialize(user),
    };
  }

  async me(userId: string) {
    const user = await this.userModel.findByPk(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return this.serialize(user);
  }
}
