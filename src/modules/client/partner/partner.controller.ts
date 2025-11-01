import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { PartnerService } from './partner.service';
import { Public } from 'src/common/decorators';

@ApiTags('🤝 Client Partners')
@Controller('client/partner')
@Public()
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) {}

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all active partners list',
    description:
      'Retrieves a list of all active partners with basic information (id, name, logo) for display purposes. Only active partners are returned.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active partners with basic information',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: {
            type: 'number',
            example: 1,
            description: 'Partner unique identifier',
          },
          name: {
            type: 'string',
            example: 'Nike',
            description: 'Partner name (localized)',
          },
          logo: {
            type: 'string',
            example: 'https://example.com/nike-logo.png',
            description: 'Partner logo URL',
          },
        },
        required: ['id', 'name', 'logo'],
      },
      example: [
        {
          id: 1,
          name: 'Nike',
          logo: 'https://example.com/nike-logo.png',
        },
        {
          id: 2,
          name: 'Adidas',
          logo: 'https://example.com/adidas-logo.png',
        },
      ],
    },
  })
  list(): Promise<{ id: number; name: string; logo: string }[]> {
    return this.partnerService.list();
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get partner by ID',
    description:
      'Retrieves detailed information about a specific active partner including name, description, contact information, and logo. The response is automatically localized based on the request language.',
  })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Partner ID',
    type: 'number',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Partner details found successfully',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          example: 1,
          description: 'Partner unique identifier',
        },
        name: {
          type: 'string',
          example: 'Nike',
          description: 'Partner name (localized based on request language)',
        },
        logo: {
          type: 'string',
          example: '/uploads/partner-logo.png',
          description: 'Partner logo URL',
        },
        description: {
          type: 'string',
          example: 'Leading sports brand providing quality athletic equipment',
          description:
            'Partner description (localized based on request language)',
        },
        phone: {
          type: 'string',
          nullable: true,
          example: '+998901234567',
          description: 'Partner contact phone number',
        },
        email: {
          type: 'string',
          nullable: true,
          example: 'contact@nike.com',
          description: 'Partner contact email address',
        },
      },
      required: ['id', 'name', 'logo', 'description'],
      example: {
        id: 1,
        name: 'Nike',
        logo: '/uploads/nike-logo.png',
        description:
          'Leading sports brand providing quality athletic equipment',
        phone: '+998901234567',
        email: 'contact@nike.com',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Partner not found or not active',
    schema: {
      type: 'object',
      properties: {
        statusCode: {
          type: 'number',
          example: 404,
        },
        message: {
          type: 'string',
          example: 'Partner with ID 1 not found or not active',
        },
        error: {
          type: 'string',
          example: 'Not Found',
        },
      },
    },
  })
  show(@Param('id', ParseIntPipe) id: number): Promise<{
    id: number;
    name: string;
    logo: string;
    description: string;
    phone: string;
    email: string;
  }> {
    return this.partnerService.show(id);
  }
}
