import {Injectable,UnauthorizedException} from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { Strategy,ExtractJwt } from "passport-jwt"
import { ConfigService } from "@nestjs/config"
import { AuthService } from "../auth.service"
import { Role } from "@prisma/client"

export interface JwtPayload{
    sub:string
    email:string
    role:Role
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,"jwt"){
    constructor(private configService:ConfigService,private authService:AuthService){
        super({
            jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration:false,
            secretOrKey:configService.get("JWT_SECRET")
        })
    }

    async validate(payload:JwtPayload){
        const user = await this.authService.validateUserById(payload.sub)
        if(!user){
            throw new UnauthorizedException("Invalid token")
        }
        return user
    }
}