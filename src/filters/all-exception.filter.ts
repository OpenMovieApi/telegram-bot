import { ArgumentsHost, Catch, ExceptionFilter, Logger } from '@nestjs/common';
import { TelegrafArgumentsHost } from 'nestjs-telegraf';
import { Context } from '../interfaces/context.interface';
import { SCENES } from '../constants/scenes.const';
import { Markup } from 'telegraf';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  async catch(exception: Error, host: ArgumentsHost): Promise<void> {
    const telegrafHost = TelegrafArgumentsHost.create(host);
    const ctx = telegrafHost.getContext<Context>();
    const scene = SCENES.ERROR(exception.message);

    Logger.error(exception.message, exception.stack, AllExceptionFilter.name);
    await ctx.replyWithHTML(scene.text, Markup.inlineKeyboard(scene.buttons));
  }
}