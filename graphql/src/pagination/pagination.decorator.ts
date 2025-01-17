import { Type } from '@nestjs/common';
import { Field, ObjectType } from '@nestjs/graphql';

export interface IPaginatedType<T> {
  next?: string;
  items: T[];
}

export function Paginated<T>(classRef: Type<T>): Type<IPaginatedType<T>> {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedType implements IPaginatedType<T> {
    @Field(() => String, { nullable: true })
    next?: string;

    @Field(() => [classRef], { nullable: true })
    items: T[];
  }
  return PaginatedType as Type<IPaginatedType<T>>;
}
