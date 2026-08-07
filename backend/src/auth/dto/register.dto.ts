import { IsEmail, IsIn, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsIn(['CUSTOMER', 'VENDOR'], { message: 'Role harus CUSTOMER atau VENDOR' })
  role: 'CUSTOMER' | 'VENDOR';
}

