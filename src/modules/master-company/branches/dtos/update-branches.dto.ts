//src/modules/master-company/branches/dtos/update-branches.dto.ts

import { CreateBranchesDto } from "./create-branches.dto";
import { PartialType } from "@nestjs/mapped-types";

// no need 
export class UpdateBranchesDto extends PartialType(CreateBranchesDto) {}    