import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";
import { Company } from "../../company/entities/company.entity";

// src/modules/master-company/branches/entities/branches.entity.ts
@Entity({name:'branches',schema:'master_company'})
export class BranchesEntity {

    @Column({
        type:'uuid',
        primary:true,
        default: () => 'uuid_generate_v7()',
    })
    id:string;

    @Column({
        type:'varchar',
        length:100
    })
    branches_name:string;

    @Column({
        type:'varchar',
        length:50
    })
    gps_location:string;

    @Column({
        type:'varchar',
        length:255
    })
    description:string;

    @Column({
        type:'varchar',
        length:20
    })
    phone:string;

    @Column({
        type:'varchar',
        length:20
    })
    status:string;

    @CreateDateColumn()
    created_at:Date;

    @UpdateDateColumn()
    updated_at:Date;

    @Column({
        type:'varchar',
        length:100
    })
    address:string;

    @Column({
        type:'varchar',
        length:50
    })
    city:string;

    @Column({
        type:'varchar',
        length:100
    })
    state:string;

   @Column({
        type:'uuid'
    })
    company_id:string;


    // @ManyToOne(()=>Company,(company)=>company.branches);
    // @JoinColumn({name:'company_id'})
    // company:Company;


}