import { IsString, IsOptional, IsBoolean, IsObject, Matches } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class UpdateBrandDto {
  @ApiPropertyOptional({ example: 'rccg' })
  @IsString()
  @IsOptional()
  @Matches(/^[a-z0-9-]{2,32}$/, { message: 'Subdomain must be lowercase alphanumeric with hyphens, 2-32 chars' })
  subdomain?: string

  @ApiPropertyOptional({ example: 'portal.rccg.org' })
  @IsString()
  @IsOptional()
  customDomain?: string

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  brandConfig?: {
    displayName?: string
    tagline?: string
    primaryColor?: string
    accentColor?: string
    logoUrl?: string
    faviconUrl?: string
    poweredByVisible?: boolean
    appName?: string
  }
}
