import './style.css';
import { Application, Assets, Sprite, Text, Rectangle } from 'pixi.js';

const CONFIG = {
  BACKGROUND_COLOR: 0x000000,
  TEXT_STYLE: {
    fill: '#ffffff',
    fontSize: 32,
  },
  SCALE_STEP: 0.1,
  MAX_SCALE: 3,
  IMAGE_OFFSET_Y: 100,
};

async function createApp(): Promise<Application> {
  const app = new Application();

  await app.init({
    backgroundColor: CONFIG.BACKGROUND_COLOR,
    resizeTo: window,
  });

  document.body.style.margin = '0';
  document.body.appendChild(app.canvas);

  return app;
}

function createCounterText(): Text {
  const text = new Text({
    text: 'Count: 0',
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

type SceneContext = {
  app: Application;
  image: Sprite;
  text: Text;
};

function setupInteraction({ app, image, text }: SceneContext): void{
  let count = 0;

  app.stage.eventMode = 'static';
  app.stage.cursor = 'pointer';

  app.stage.on('pointerdown', () => {
    count += 1;
    text.text = `Count: ${count}`;

    const nextScale = Math.min(
      image.scale.x + CONFIG.SCALE_STEP,
      CONFIG.MAX_SCALE
    );

    image.scale.set(nextScale);
  });
}

function setupResize({ app, image, text }: SceneContext): () => void {
  const hitArea = new Rectangle();

  function resize() {
    const { width, height } = app.screen;

    text.position.set(width / 2, height / 2);
    image.position.set(width / 2, height / 2 + CONFIG.IMAGE_OFFSET_Y);

    hitArea.width = width;
    hitArea.height = height;
    app.stage.hitArea = hitArea;
  }

  resize();
  app.renderer.on('resize', resize);

  return () => {
    app.renderer.off('resize', resize);
  };
}

async function main(): Promise<void> {
  const app = await createApp();

  const text = createCounterText();
  const image = await createImage(0.5);

  app.stage.addChild(image, text);

  setupInteraction({ app, image, text });
  setupResize({ app, image, text });
}

main();
