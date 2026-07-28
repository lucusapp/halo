import { NewsCategory } from '@localnow/shared';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

// Alta de una fuente RSS (§4.3). feedUrl es opcional a propósito: una fuente sin
// feedUrl configurado queda excluida del cron de fetchAndStore (misma condición que
// ya usa su query), útil para darla de alta y activarla más tarde.
export class CreateNewsSourceDto {
  @IsString()
  @IsNotEmpty()
  cityId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUrl()
  url!: string;

  @IsOptional()
  @IsUrl()
  feedUrl?: string;

  // Ya no obliga a que todos los artículos de la fuente compartan esta categoría:
  // solo actúa de resguardo cuando la heurística por palabras clave no identifica
  // ninguna categoría en el artículo (ver categorize-article.util.ts).
  @IsOptional()
  @IsEnum(NewsCategory)
  category?: NewsCategory;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
