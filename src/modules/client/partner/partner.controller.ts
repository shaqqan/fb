import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PartnerService } from './partner.service';
import { Public } from 'src/common/decorators';

@ApiTags('🤝 Client Partners')
@Controller('client/partner')
@Public()
export class PartnerController {
  constructor(private readonly partnerService: PartnerService) { }

  @Get('list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all active partners list',
    description: 'Retrieves a list of all active partners with basic information (id, name, logo) for display purposes. Only active partners are returned.'
  })
  @ApiResponse({
    status: 200,
    description: 'List of active partners with basic information',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1, description: 'Partner unique identifier' },
          name: { type: 'string', example: 'Nike', description: 'Partner name (localized)' },
          logo: { type: 'string', example: 'https://example.com/nike-logo.png', description: 'Partner logo URL' }
        },
        required: ['id', 'name', 'logo']
      },
      example: [
        {
          id: 1,
          name: 'Nike',
          logo: 'https://example.com/nike-logo.png'
        },
        {
          id: 2,
          name: 'Adidas',
          logo: 'https://example.com/adidas-logo.png'
        }
      ]
    }
  })
  list(): Promise<{ id: number, name: string, logo: string }[]> {
    return this.partnerService.list();
  }
}
