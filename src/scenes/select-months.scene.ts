import { CommandEnum } from '../enum/command.enum';
import { AbstractScene } from '../abstract/abstract.scene';
import { Action, Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import { Logger } from '@nestjs/common';
import { Context } from 'src/interfaces/context.interface';
import { TariffService } from 'src/tariff/tariff.service';
import { replyOrEdit } from 'src/utils/reply-or-edit.util';
import { Markup } from 'telegraf';

@Scene(CommandEnum.SELECT_MONTHS)
export class SelectMonthsScene extends AbstractScene {
  public logger = new Logger(AbstractScene.name);

  constructor(private readonly tariffService: TariffService) {
    super();
  }

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Context) {
    this.logger.log(ctx.scene.session.current);
    ctx.session.paymentMonths = 1;

    await this.sendMessage(ctx);
  }

  @Action('plus')
  async plus(@Ctx() ctx: Context) {
    this.logger.log(ctx.scene.session.current);
    if (ctx.session.paymentMonths < 25) {
      ctx.session.paymentMonths += 1;

      await this.sendMessage(ctx);
    }
  }

  @Action('minus')
  async minus(@Ctx() ctx: Context) {
    this.logger.log(ctx.scene.session.current);
    if (ctx.session.paymentMonths > 1) {
      ctx.session.paymentMonths -= 1;

      await this.sendMessage(ctx);
    }
  }

  @Action('ok')
  async ok(@Ctx() ctx: Context) {
    this.logger.log(ctx.scene.session.current);
    if (ctx.session.paymentMonths >= 1) {
      ctx.scene.enter(CommandEnum.PAYMENT);
    } else {
      this.logger.warn('ctx.session.paymentMonths >= 1', ctx.session.paymentMonths >= 1);
    }
  }

  private async sendMessage(ctx) {
    const { paymentMonths, tariffId } = ctx.session;
    const { price } = await this.tariffService.getOneById(tariffId);
    return replyOrEdit(
      ctx,
      `Установите время действия подписки 🔢\n\nПодписка на: <b>${paymentMonths} мес</b>. \n\nФинальная стоимость: <b>${
        price * paymentMonths
      } руб.</b>`,
      Markup.inlineKeyboard([
        [Markup.button.callback('-', 'minus'), Markup.button.callback('+', 'plus')],
        [Markup.button.callback('✅ подтвердить', 'ok')],
      ]),
    );
  }
}
