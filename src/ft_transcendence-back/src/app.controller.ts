import { Controller, Get, Param, HttpService, Post } from '@nestjs/common';


@Controller('login')
export class AppController {
  constructor(private readonly httpService: HttpService) { }

  @Get(":code")
  async getToken(@Param("code") code) {
    if (code != "") {
      const token = {
        grant_type: "authorization_code",
        client_id: '24505a193a1387501b4477352c3a949680f317d28f3354226ed21b6f294d3f13',
        client_secret: 'f62a24bf3e2a8320a6db516ed48aa80696b4c539e19c46537f4948fa48a9f884',
        code: code,
        redirect_uri: 'http://localhost:8080/login/'
      }
      //console.log(token);
      const resp = await this.httpService.post('https://api.intra.42.fr/oauth/token/', token).toPromise()
      return ({ token: resp.data.access_token })

    }
    return undefined;
  }

  @Post(':token')
  async login(@Param("token") token) {
    const headReq = {
      'Authorization': `Bearer ${token}`
    }
    const me = await this.httpService.get(' https://api.intra.42.fr/v2/me', { headers: headReq }).toPromise()
    console.log("token for", me.data.login)
    return { intra_id: me.data.id, login: me.data.login }
  }
}



