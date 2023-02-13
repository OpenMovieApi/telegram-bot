import { Ctx, Scene, SceneEnter } from 'nestjs-telegraf';
import { CommandEnum } from '../enum/command.enum';
import { AbstractScene } from '../abstract/abstract.scene';
import { Model } from 'mongoose';
import { Tariff } from 'src/tariff/schemas/tariff.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { SCENES } from 'src/constants/scenes.const';
import { Markup } from 'telegraf';
import { Context } from 'src/interfaces/context.interface';
import { TariffService } from 'src/tariff/tariff.service';

@Scene(CommandEnum.UPDATE_TARIFF)
export class UpdateTariffScene extends AbstractScene {
  public logger = new Logger(AbstractScene.name);

  constructor(private readonly tariffService: TariffService) {
    super();
  }

  @SceneEnter()
  async onSceneEnter(@Ctx() ctx: Context) {
    this.logger.log(ctx.scene.session.current);
    const tariffs = (await this.tariffService.getAllTariffs()).filter((tariff) => tariff.price !== 0).reverse();
    const scene = SCENES[ctx.scene.session.current];

    await ctx.replyWithHTML(scene.text(tariffs), Markup.inlineKeyboard(scene.buttons(tariffs)));
  }
}
