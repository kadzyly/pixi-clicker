import './style.css';
import { Application, Assets, Sprite, Text, Rectangle, TilingSprite } from 'pixi.js';

const CONFIG = {
  BACKGROUND_COLOR: 0x000000, // black
  TEXT_STYLE: {
    fill: '#ffffff',
    fontSize: 30,
  },
  SCALE_STEP: 0.1,
  MAX_SCALE: 3,
  IMAGE_OFFSET_Y: 60,
  TEXT_OFFSET_Y: -60,
};

type SceneContext = {
  app: Application;
  image: Sprite;
  text: Text;
  background: TilingSprite;
};

type GameState = {
  count: number;
};

const state: GameState = {
  count: 0,
};

function getCounterText(count: number): string {
  return `Count: ${count}`;
}


async function createApp(): Promise<Application> {
  const app = new Application();

  await app.init({
    backgroundColor: CONFIG.BACKGROUND_COLOR,
    resizeTo: window,
    resolution: window.devicePixelRatio,
    autoDensity: true,
  });

  document.body.style.margin = '0';
  document.body.appendChild(app.canvas);

  return app;
}

async function createBackground(width: number, height: number): Promise<TilingSprite> {
  const texture = await Assets.load('./background.jpg');

  const background = new TilingSprite({ texture, width, height });

  background.alpha = 0.5;
  background.tint = 0x808080; // gray
  background.position.set(0, 0);

  return background;
}

function createCounterText(): Text {
  const text = new Text({
    text: getCounterText(state.count),
    style: CONFIG.TEXT_STYLE,
  });

  text.anchor.set(0.5);

  return text;
}

async function createImage(scale: number): Promise<Sprite> {
  const texture = await Assets.load('./pixi-logo.png');
  const image = new Sprite(texture);

  image.anchor.set(0.5);
  image.scale.set(scale);

  return image;
}

function setupInteraction({ app, image, text }: SceneContext): void {
  app.stage.eventMode = 'static';
  app.stage.interactiveChildren = false;
  app.stage.cursor = 'pointer';

  const onPointerDown = (): void => {
    state.count += 1;
    text.text = getCounterText(state.count);

    const nextScale = Math.min(
      image.scale.x + CONFIG.SCALE_STEP,
      CONFIG.MAX_SCALE
    );

    image.scale.set(nextScale);
  };

  app.stage.on('pointerdown', onPointerDown);
}

function setupResize({ app, image, text, background }: SceneContext): void {
  const hitArea = new Rectangle();
  app.stage.hitArea = hitArea;

  function resize() {
    const { width, height } = app.screen;

    background.width = width;
    background.height = height;

    text.position.set(width / 2, height / 2 + CONFIG.TEXT_OFFSET_Y);
    image.position.set(width / 2, height / 2 + CONFIG.IMAGE_OFFSET_Y);

    hitArea.width = width;
    hitArea.height = height;
  }

  resize();
  app.renderer.on('resize', resize);
}

async function main(): Promise<void> {
  const app = await createApp();

  const background = await createBackground(app.screen.width, app.screen.height);
  const text = createCounterText();
  const image = await createImage(0.5);

  app.stage.addChild(background, image, text);

  setupInteraction({ app, image, text, background });
  setupResize({ app, image, text, background });
}

main();
