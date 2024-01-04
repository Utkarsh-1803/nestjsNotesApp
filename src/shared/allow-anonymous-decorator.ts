// allow-anonymous.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const AllowAnonymous = () => SetMetadata('allow-anonymous', true);
