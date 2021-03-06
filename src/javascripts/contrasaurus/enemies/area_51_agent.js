function Area51Agent(I) {
  I = I || {};

  var standModel = Model.loadJSONUrl("data/secret_service/stand.model.json");
  var runModel = Model.loadJSONUrl("data/secret_service/run.model.json");
  var bitInHalfModel = Model.loadJSONUrl("data/secret_service/bit_in_half.model.json");
  var deathModel = Model.loadJSONUrl("data/secret_service/death.model.json");
  var burningAnimation = Animation.load({
    url: "images/enemies/burning_man.png",
    frames: 20,
    width: 57,
    height: 89,
    delay: 3
  });

  var states = {
    run: State({
      duration: Infinity,
      model: runModel
    }),
    stand: State({
      complete: function() {
        I.currentState = states.run;
        I.xVelocity = 4;
      },
      duration: 60,
      model: standModel,
      update: function() {
        I.xVelocity = 0;
      }
    })
  };

  $.reverseMerge(I, {
    currentState: states.stand,
    nutrition: 50,
    type: 'area 51 agent',
    x: rand(CANVAS_WIDTH),
    y: CANVAS_HEIGHT - Floor.LEVEL - 20,
  });

  var self = Enemy(I).extend({});

  self.bind('destroy', function(self) {
    var deathAnimation;
    var xOffset = 0;
    var yOffset = 0;

    if(I.onFire) {
      deathAnimation = burningAnimation;
      yOffset = -13;
      xOffset = 2;
    } else if(I.bitInHalf) {
      deathAnimation = bitInHalfModel.animation;
      xOffset = 20;
    } else {
      Sound.play("die");
      deathAnimation = deathModel.animation;
    }

    var effectI = self.position();

    var effect = Effect($.extend(effectI, {
      //TODO: This -1 is probably symptomatic of a deeper error
      duration: deathAnimation.duration() - 1,
      hFlip: I.hFlip,
      sprite: deathAnimation,
      velocity: Point(0, 0),
      x: I.x + xOffset,
      y: I.y + yOffset
    }));

    addGameObject(effect);
  });

  self.extend(Biteable(I));
  self.extend(Burnable(I));
  self.extend(Chopable(I));
  self.extend(Stateful(I));

  return self;
}
