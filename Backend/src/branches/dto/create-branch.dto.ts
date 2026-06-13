import { IsString, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBranchDto {
  @ApiProperty({ example: 'สาขา 1' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'หน้าคณะสหเวช(อาคารวิทยาศาสตร์การแพทย์)' })
  @IsString()
  @IsNotEmpty()
  district: string;

  @ApiProperty({ example: '0953325290' })
  @IsString()
  @IsNotEmpty()
  contactNumber: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  status: boolean;

  @ApiProperty({ example: '13.7563' })
  @IsString()
  @IsNotEmpty()
  latitude: string;

  @ApiProperty({ example: '100.5018' })
  @IsString()
  @IsNotEmpty()
  longitude: string;

  @ApiProperty({ example: '10000' })
  @IsString()
  @IsNotEmpty()
  radius: string;
}
