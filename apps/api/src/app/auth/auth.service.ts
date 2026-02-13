import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { LoginResponseDto } from '@app/data';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService
  ) {}

  async login(dto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      select: ['id', 'email', 'passwordHash', 'organizationId', 'role', 'createdAt'],
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
      role: user.role,
    };
    const access_token = this.jwtService.sign(payload);
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        organizationId: user.organizationId,
        role: user.role,
      },
    };
  }
}
