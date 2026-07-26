import { IsNotEmpty, IsString } from 'class-validator';

// El body del §12 (`{ token, commerce_id }`) incluye commerce_id explícito, pero eso
// permitiría a cualquier comercio autenticado validar QRs "en nombre de" otro
// comercio con solo cambiar ese campo. El commerceId se deriva siempre del JWT
// (igual que en el resto de la API) — aquí solo hace falta el token.
export class ValidateQrDto {
  @IsString()
  @IsNotEmpty()
  token!: string;
}
