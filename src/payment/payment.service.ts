import { Payment, PaymentDocument } from './schemas/payment.schema';

import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger } from '@nestjs/common';
import mongoose, { Model } from 'mongoose';

import { PaymentStrategyFactory } from './strategies/factory/payment-strategy.factory';
import { PaymentSystemEnum } from './enum/payment-system.enum';
import { Tariff } from 'src/tariff/schemas/tariff.schema';
import { TariffService } from 'src/tariff/tariff.service';
import { UserService } from 'src/user/user.service';
import { PaymentStatusEnum } from './enum/payment-status.enum';
import { DateTime } from 'luxon';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  constructor(
    private readonly userService: UserService,
    private readonly tariffService: TariffService,
    private readonly paymentStrategyFactory: PaymentStrategyFactory,
    @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
  ) {}

  async createPayment(
    userId: number,
    chatId: number,
    tariffId: string,
    paymentSystem: PaymentSystemEnum,
    paymentMonths: number,
    paymentAt?: Date,
  ): Promise<Payment> {
    const user = await this.userService.findOneByUserId(userId);

    if (!user) throw new Error('User not found');
    if (!user?.chatId) await this.userService.update(user.userId, { chatId });

    const tariff: Tariff = await this.tariffService.getOneById(tariffId);
    if (!tariff) throw new Error(`Tariff with id ${tariffId} not found`);

    const paymentStrategy = this.paymentStrategyFactory.createPaymentStrategy(paymentSystem);
    const payment = await paymentStrategy.createPayment({
      userId,
      chatId,
      tariffId,
      tariffPrice: tariff.price,
      paymentMonths,
      paymentAt: paymentAt || DateTime.local().toJSDate(),
    });
    return this.paymentModel.create(payment);
  }

  async getPendingPayments(): Promise<Payment[]> {
    return this.paymentModel.find({ status: PaymentStatusEnum.PENDING }).exec();
  }

  async updatePaymentStatus(paymentId: string, status: string, isFinal: boolean): Promise<void> {
    await this.paymentModel.updateOne({ paymentId }, { status, isFinal }).exec();
  }

  async findPaymentById(id: string): Promise<Payment> {
    return this.paymentModel.findById(id).exec();
  }

  async validatePayment(paymentId: string): Promise<boolean> {
    const payment = await this.paymentModel.findOne({ paymentId }).exec();
    if (!payment) throw new Error(`Payment with id ${paymentId} not found`);

    const paymentStrategy = this.paymentStrategyFactory.createPaymentStrategy(payment.paymentSystem);

    const paymentStatus = await paymentStrategy.validateTransaction(payment.paymentId);
    const isPaid = paymentStatus === PaymentStatusEnum.PAID;

    if (isPaid) {
      const startAt = DateTime.fromJSDate(payment.paymentAt);
      const expiredAt = startAt.plus({ months: payment.monthCount });

      const user = await this.userService.findOneByUserId(payment.userId);

      if (user) {
        await this.userService.update(user.userId, {
          tariffId: new mongoose.Types.ObjectId(payment.tariffId),
          subscriptionStartDate: startAt.toJSDate(),
          subscriptionEndDate: expiredAt.toJSDate(),
        });
      }

      this.logger.debug(`Change status for ${paymentId} on ${paymentStatus}. IsPaid: ${isPaid}`);
      await this.updatePaymentStatus(paymentId, PaymentStatusEnum.PAID, isPaid);
    } else {
      if (paymentStatus !== payment.status) {
        this.logger.debug(`Change status for ${paymentId} on ${paymentStatus}, IsPaid: ${isPaid}`);
        await this.updatePaymentStatus(paymentId, paymentStatus, isPaid);
      }
    }

    return isPaid;
  }
}
