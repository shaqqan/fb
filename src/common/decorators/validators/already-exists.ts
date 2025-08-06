import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, ValidationOptions, registerDecorator } from "class-validator";
import dataSource from "src/databases/typeorm/data-source";
import { EntityPropertyNotFoundError, EntityTarget } from "typeorm";

@ValidatorConstraint({ name: 'AlreadyExists', async: true })
@Injectable()
export class AlreadyExistsConstraint implements ValidatorConstraintInterface {
    async validate(value: any, validationArguments?: ValidationArguments): Promise<boolean> {
        try {
            if (!value) {
                return false
            } 

            const model = validationArguments?.constraints[0];
            const field = validationArguments?.constraints[1];
            const localeRepository = dataSource.getRepository(model)
            const isExist = await localeRepository.findOne({
                where: { [field]: value },
            })

            return !!!isExist;
        } catch (error) {
            if (error instanceof EntityPropertyNotFoundError) {
                throw new NotFoundException(error.message)
            }
            console.error('error by already exists dto', error);
            throw new InternalServerErrorException(error.message)
        }

    }

    defaultMessage?(args: ValidationArguments): string {
        return `'${args?.property}' ${args?.value} already exists`;
    }
}

export function AlreadyExists(
    model: EntityTarget<any>,
    field: string,
    validationOptions?: ValidationOptions,
) {
    return function (object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [model, field],
            validator: AlreadyExistsConstraint,
        });
    };
}