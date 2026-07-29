-- AlterEnum
BEGIN;
CREATE TYPE "CommerceCategory_new" AS ENUM ('DEPORTES', 'ECONOMIA', 'GASTRONOMIA', 'HOGAR_DECORACION', 'SALUD_BIENESTAR', 'CULTURA_OCIO', 'EDUCACION', 'TECNOLOGIA', 'MODA_BELLEZA', 'MOTOR', 'MASCOTAS', 'INMOBILIARIA');
ALTER TABLE "commerces" ALTER COLUMN "category" TYPE "CommerceCategory_new" USING ("category"::text::"CommerceCategory_new");
ALTER TYPE "CommerceCategory" RENAME TO "CommerceCategory_old";
ALTER TYPE "CommerceCategory_new" RENAME TO "CommerceCategory";
DROP TYPE "CommerceCategory_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "NewsCategory_new" AS ENUM ('MUNICIPIO', 'DEPORTES', 'ECONOMIA', 'GASTRONOMIA', 'HOGAR_DECORACION', 'SALUD_BIENESTAR', 'CULTURA_OCIO', 'EDUCACION', 'TECNOLOGIA', 'MODA_BELLEZA', 'MOTOR', 'MASCOTAS', 'INMOBILIARIA', 'JUDICIAL', 'SOCIEDAD');
ALTER TABLE "news_sources" ALTER COLUMN "category" TYPE "NewsCategory_new" USING ("category"::text::"NewsCategory_new");
ALTER TABLE "news_articles" ALTER COLUMN "category" TYPE "NewsCategory_new" USING ("category"::text::"NewsCategory_new");
ALTER TYPE "NewsCategory" RENAME TO "NewsCategory_old";
ALTER TYPE "NewsCategory_new" RENAME TO "NewsCategory";
DROP TYPE "NewsCategory_old";
COMMIT;

