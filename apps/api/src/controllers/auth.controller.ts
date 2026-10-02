import { Request, Response, NextFunction } from 'express';
import { CookieOptions } from 'express';
import { ApiConfig } from '@ai-gurukul/config';
import {
  ChangePasswordDTO,
  LoginRequestDTO,
  RegisterRequestDTO,
  UpdateProfileDTO,
} from '@ai-gurukul/types';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  private readonly authService: AuthService;
  private readonly config: ApiConfig;

  constructor(authService: AuthService, config: ApiConfig) {
    this.authService = authService;
    this.config = config;
  }

  private getCookieOptions(maxAgeMs: number): CookieOptions {
    const isProd = this.config.NODE_ENV === 'production';
    return {
      httpOnly: true,
      secure: isProd,
      sameSite: 'strict',
      path: '/',
      maxAge: maxAgeMs,
    };
  }

  private setAuthCookies(
    res: Response,
    tokens: { accessToken: string; refreshToken: string }
  ): void {
    // 15 minutes access token cookie
    res.cookie('access_token', tokens.accessToken, this.getCookieOptions(15 * 60 * 1000));
    // 7 days refresh token cookie
    res.cookie(
      'refresh_token',
      tokens.refreshToken,
      this.getCookieOptions(7 * 24 * 60 * 60 * 1000)
    );
  }

  private clearAuthCookies(res: Response): void {
    const clearOptions: CookieOptions = {
      httpOnly: true,
      secure: this.config.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    };
    res.clearCookie('access_token', clearOptions);
    res.clearCookie('refresh_token', clearOptions);
  }

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as RegisterRequestDTO;
      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await this.authService.register(dto, clientInfo);

      if (result.tokens) {
        this.setAuthCookies(res, result.tokens);
      }

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dto = req.body as LoginRequestDTO;
      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await this.authService.login(dto, clientInfo);

      if (result.tokens) {
        this.setAuthCookies(res, result.tokens);
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public googleLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { idToken } = req.body as { idToken: string };
      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await this.authService.googleLogin(idToken, clientInfo);

      if (result.tokens) {
        this.setAuthCookies(res, result.tokens);
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
      const clientInfo = {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      };

      const result = await this.authService.refreshSession(refreshToken, clientInfo);

      if (result.tokens) {
        this.setAuthCookies(res, result.tokens);
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  };

  public logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
      await this.authService.logout(refreshToken);
      this.clearAuthCookies(res);

      res.status(200).json({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    } catch (err) {
      next(err);
    }
  };

  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const profile = await this.authService.getProfile(userId);

      res.status(200).json({
        success: true,
        data: { user: profile },
      });
    } catch (err) {
      next(err);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const dto = req.body as UpdateProfileDTO;
      const updated = await this.authService.updateProfile(userId, dto);

      res.status(200).json({
        success: true,
        data: { user: updated },
      });
    } catch (err) {
      next(err);
    }
  };

  public changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const userId = req.user!.sub;
      const dto = req.body as ChangePasswordDTO;
      await this.authService.changePassword(userId, dto);
      this.clearAuthCookies(res);

      res.status(200).json({
        success: true,
        data: { message: 'Password changed successfully. Please log in again.' },
      });
    } catch (err) {
      next(err);
    }
  };
}
