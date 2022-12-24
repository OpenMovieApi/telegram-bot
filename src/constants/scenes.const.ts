import { CommandEnum } from '../enum/command.enum';
import { BUTTONS } from './buttons.const';

export const SCENES = {
  [CommandEnum.START]: {
    text: 'Привет! Я бот который поможет тебе получить токен для работы с API kinopoisk.dev. \n\n Для начала выбери действие:',
    buttons: [
      [BUTTONS[CommandEnum.GET_ACCESS]],
      [BUTTONS[CommandEnum.QUESTION]],
      [BUTTONS[CommandEnum.I_HAVE_TOKEN]],
    ],
  },
  [CommandEnum.HOME]: {
    text: 'Выбери действие:',
    buttons: [
      [BUTTONS[CommandEnum.GET_ACCESS]],
      [BUTTONS[CommandEnum.QUESTION]],
      [BUTTONS[CommandEnum.I_HAVE_TOKEN]],
    ],
  },
  [CommandEnum.GET_ACCESS]: {
    text: `Для получения доступа к API тебе нужно выбрать тарифный план по количеству запросов в сутки. \n\nТарифы: \n<b>${
      BUTTONS[CommandEnum.FREE_TARIFF].text
    }</b> - Всегда бесплатный.\n<b>${
      BUTTONS[CommandEnum.DEVELOPER_TARIFF].text
    }</b> - <i>500</i> рублей в месяц.\n<b>${
      BUTTONS[CommandEnum.UNLIMITED_TARIFF].text
    }</b> - <i>2000</i> рублей в месяц.`,
    buttons: [
      [BUTTONS[CommandEnum.FREE_TARIFF], BUTTONS[CommandEnum.DEVELOPER_TARIFF]],
      [BUTTONS[CommandEnum.UNLIMITED_TARIFF]],
    ],
  },
  [CommandEnum.FREE_TARIFF]: {
    text: `Отлично! Но перед этим к тебе есть небольшая просьба, зайди к нам в общий чат 😇\n\nВ нем ты всегда можешь получить поддержку от сообщества и администрации, а в замен я дам тебе токен!`,
    buttons: [
      BUTTONS[CommandEnum.JOIN_CHAT],
      BUTTONS[CommandEnum.CONFIRM_JOIN_CHAT],
    ],
    actions: {
      [CommandEnum.CONFIRM_JOIN_CHAT]: {
        success: (token: string) => ({
          text: `Теперь, ты можешь пользоваться API: \n\n<code>${token}</code>`,
          buttons: [BUTTONS[CommandEnum.HOME]],
        }),
        error: () => ({
          text: `Ты не вступил в чат 😔`,
          buttons: [BUTTONS[CommandEnum.JOIN_CHAT]],
        }),
      },
    },
  },
  [CommandEnum.DEVELOPER_TARIFF]: {
    text: `Оплата пока что не доступна, свяжитесь с администрацией для получения доступа. \n\n Главный разработчик: @mdwit`,
  },
  [CommandEnum.UNLIMITED_TARIFF]: {
    text: `Оплата пока что не доступна, свяжитесь с администрацией для получения доступа. \n\n Главный разработчик: @mdwit`,
  },
  [CommandEnum.QUESTION]: {
    text: `Если у тебя есть вопрос, то ты можешь задать его в нашем чате. \n\n Чтобы вступить в чат нажми на кнопку ниже.`,
    buttons: [BUTTONS[CommandEnum.JOIN_CHAT]],
  },
  [CommandEnum.GET_REQUEST_STATS]: {
    success: {
      text: `Вот статистика по использованию API:`,
    },
    error: {
      text: `Вы еще не зарегистрированы в системе, для этого вам нужно получить токен.`,
    },
  },
  [CommandEnum.I_HAVE_TOKEN]: {
    text: `Давай проверим его! И если все ок, привяжем его к твоему аккаунту! \n\n Введи токен:`,
    scenes: {
      [CommandEnum.BIND_TOKEN]: {
        success: {
          text: `О, спасибо, я запомню, что он твой! \n\n Теперь ты можешь получить статистику по использованию API!`,
        },
        error: {
          text: `Этот токен не твой или не существует!`,
          buttons: [
            BUTTONS[CommandEnum.BACK],
            [BUTTONS[CommandEnum.GET_ACCESS]],
          ],
        },
      },
    },
  },
  ERROR: (message: string) => ({
    text: `Прошу прошения, но у меня тут ошибка: ${message}`,
    buttons: [BUTTONS[CommandEnum.BACK], BUTTONS[CommandEnum.HOME]],
  }),
};
