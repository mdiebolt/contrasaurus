(function() {
  var scene = Scene([
    {
      image: Sprite.load("images/levels/parasail/coast.png"),
      parallaxRate: 0,
      position: {
        x: 0,
        y: 0
      }
    },
    {
      image: Sprite.load("images/levels/clouds2.png"),
      parallaxRate: 1,
      rate: {x: -0.5},
      position: {
        x: 0,
        y: 0
      },
      repeat: true,
      width: 640
    }
  ], [
    {
      image: Sprite.load("images/levels/clouds1.png"),
      parallaxRate: 1,
      rate: {x: -1},
      position: {
        x: 0,
        y: 0
      },
      repeat: true,
      width: 640
    },
    {
      image: Sprite.load("images/levels/parasail/speed-boat.png"),
      parallaxRate: 0,
      position: {
        x: 320,
        y: 285
      }
    },
    {
      image: Sprite.load("images/levels/parasail/ocean.png"),
      parallaxRate: 1,
      rate: {x: -3},
      position: {
        x: 0,
        y: 320
      },
      repeat: true,
      width: 640
    }
  ]);

  var floor = Floor({
    sprite: null,
    water: true
  });

  var triggers = [{
    at: 0,
    event: function(level) {
      dino.parasailing(true);
    }
  }, {
    every: 30,
    event: function(level) {
      level.addGameObject(Parasoldier({
          xVelocity: 0,
          x: level.position().x + rand(CANVAS_WIDTH - 40) + 20
        }));
    }
  }, {
    at: 500,
    event: function(level) {
      level.complete();
      dino.parasailing(false);
    }
  }];

  addLevel(scene, [floor], triggers);
}());
