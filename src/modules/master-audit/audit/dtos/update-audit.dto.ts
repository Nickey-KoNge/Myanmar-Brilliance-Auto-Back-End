//src/modules/master-audit/audit/dtos/update-audit.dto.ts

import { CreateAuditDto } from './create-audit.dto';
import { PartialType } from '@nestjs/mapped-types';

// no need
export class UpdateAuditDto extends PartialType(CreateAuditDto) {}
