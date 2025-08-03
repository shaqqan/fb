import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';

import { Public, GetCurrentUserId, GetCurrentUser } from '../../../common/decorators';
import { RtGuard } from '../../../common/guards/rt.guard';
import { AuthService } from './auth.service';
import { AuthDto, SignUpDto } from './dto';
import { Tokens } from '../../../common/types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // @Public()
  // @Post('signup')
  // @HttpCode(HttpStatus.CREATED)
  // @ApiOperation({ summary: 'Register a new user' })
  // @ApiBody({ type: SignUpDto })
  // @ApiResponse({ 
  //   status: 201, 
  //   description: 'User successfully registered',
  //   type: 'object',
  //   schema: {
  //     properties: {
  //       access_token: { type: 'string' },
  //       refresh_token: { type: 'string' },
  //     },
  //   },
  // })
  // @ApiResponse({ status: 400, description: 'Bad request' })
  // @ApiResponse({ status: 403, description: 'Credentials incorrect' })
  // signup(@Body() dto: SignUpDto): Promise<Tokens> {
  //   return this.authService.signup(dto);
  // }

  @Public()
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in user' })
  @ApiBody({ type: AuthDto })
  @ApiResponse({ 
    status: 200, 
    description: 'User successfully signed in',
    type: 'object',
    schema: {
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
        id: { type: 'number' },
        name: { type: 'string' },
        email: { type: 'string' },
        role: { type: 'string', enum: ['ADMIN', 'MODER'] },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  signin(@Body() dto: AuthDto): Promise<Tokens> {
    return this.authService.signin(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'User successfully logged out' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  logout(@GetCurrentUserId() userId: number): Promise<boolean> {
    return this.authService.logout(userId);
  }

  @Public()
  @UseGuards(RtGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token successfully refreshed',
    type: 'object',
    schema: {
      properties: {
        access_token: { type: 'string' },
        refresh_token: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Access denied' })
  refreshTokens(
    @GetCurrentUserId() userId: number,
    @GetCurrentUser('refreshToken') refreshToken: string,
  ): Promise<Tokens> {
    return this.authService.refreshTokens(userId, refreshToken);
  }
}
