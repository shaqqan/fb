import { Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, ValidationOptions, registerDecorator } from "class-validator";
import { EntityPropertyNotFoundError, EntityTarget, In } from "typeorm";
import dataSource from "src/databases/typeorm/data-source";

@ValidatorConstraint({ name: 'Exists', async: true })
@Injectable()
export class ExistsConstraint implements ValidatorConstraintInterface {
    async validate(value: any, validationArguments?: ValidationArguments): Promise<boolean> {
        try {
            if (!value) {
                return false
            }

            if (!validationArguments?.constraints) {
                return false;
            }

            const model = validationArguments.constraints[0];
            const field = validationArguments.constraints[1];

            const localeRepository = dataSource.getRepository(model)

            // Handle both single values and arrays
            const values = Array.isArray(value) ? value : [value];

            const isExist = await localeRepository.findOne({
                where: { [field]: In(values) },
            })
            return !!isExist;
        } catch (error) {
            if (error instanceof EntityPropertyNotFoundError) {
                throw new NotFoundException(error.message)
            }
            console.error('error by exist dto', error);
            throw new InternalServerErrorException(error.message)
        }
    }
    defaultMessage?(args: ValidationArguments): string {
        return `'${args.property}' ${args.value} doesn't exist`;
    }
}

export function Exists(
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
            validator: ExistsConstraint,
        });
    };
}