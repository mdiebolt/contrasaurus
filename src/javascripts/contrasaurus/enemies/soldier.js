function Soldier(I) {
  I = I || {};

  var runModel = Model.loadJSONUrl("data/sandinista/run.model.json");
  var shootModel = Model.loadJSONUrl("data/sandinista/shoot.model.json");
  var bitInHalfModel = Model.loadJSONUrl("data/sandinista/bit_in_half.model.json");
  var deathModel = Model.loadJSONUrl("data/sandinista/normal_death.model.json");
  var parachuteFallModel = Model.loadJSONUrl("data/sandinista/parasoldier_fall.model.json");
  var parachuteShootModel = Model.loadJSONUrl("data/sandinista/parasoldier_shoot.model.json");

  var parachuteSprite = Animation.load({
    url: "images/enemies/soldier_parachute.png",
    frames: 4,
    width: 76,
    height: 41,
    delay: 3
  });

  var burningAnimation = Animation.load({
    url: "images/enemies/burning_man.png",
    frames: 20,
    width: 57,
    height: 89,
    delay: 3
  });

  var states = {
    parachuteFall: State({
      model: parachuteFallModel,
      shootLogic: $.noop,
      update: function() {
        if (Math.random() < 0.01) {
          I.currentState = states.parachuteShoot;
        }
      }
    }),
    parachuteShoot: State({
      complete: function() {
        I.currentState = states.parachuteFall;
      },
      duration: 12,
      model: parachuteShootModel,
      shootLogic: function() {
        var t = self.getTransform();

        var shootPoint = states.shoot.model().attachment("shot");
        var direction = shootPoint.direction;

        var p = t.transformPoint(shootPoint);

        var tmpPoint = t.deltaTransformPoint(Point(Math.cos(direction), Math.sin(direction)));
        var theta = Point.direction(Point(0,0), tmpPoint);

        if(shootPoint.x != 0) {
          addGameObject(Bullet({
            collisionType: "enemyBullet",
            sprite: Sprite.load("images/effects/enemybullet1_small.png"),
            theta: theta,
            x: p.x - 15,
            y: p.y + 4
          }));
        }
      }
    }),
    shoot: State({
      complete: function() {
        I.currentState = states.run;
      },
      duration: 24,
      model: shootModel,
      shootLogic: function() {
        var t = self.getTransform();

        var shootPoint = states.shoot.model().attachment("shot");
        var direction = shootPoint.direction;

        var p = t.transformPoint(shootPoint);

        var tmpPoint = t.deltaTransformPoint(Point(Math.cos(direction), Math.sin(direction)));
        var theta = Point.direction(Point(0,0), tmpPoint);

        if(shootPoint.x != 0) {
          addGameObject(Bullet({
            collisionType: "enemyBullet",
            sprite: Sprite.load("images/effects/enemybullet1_small.png"),
            theta: theta,
            x: p.x,
            y: p.y
          }));
        }
      }
    }),
    run: State({
      complete: function() {
        if (Math.random() < 0.04) {
          I.currentState = states.shoot;
        }
      },
      duration: 24,
      model: runModel,
      shootLogic: $.noop
    })
  };

  $.reverseMerge(I, {
    airborne: false,
    currentState: states.run,
    shootLogic: $.noop,
    nutrition: 50,
    type: 'sandinista',
    x: rand(CANVAS_WIDTH),
    y: CANVAS_HEIGHT - Floor.LEVEL - 20,
    yVelocity: 0
  });

  var self = Enemy(I).extend({
    land: function(h) {
      if(I.airborne) {
        I.y = h - (I.radius + 1);
        I.yVelocity = 0;
        I.xVelocity = -2;
        I.airborne = false;
        I.currentState = states.run;
      }
    },
    after: {
      update: function() {
        I.shootLogic = I.currentState.shootLogic();
        parachuteSprite.update();

        if (I.airborne && I.currentState !== states.parachuteShoot) {
          I.currentState = states.parachuteFall;
        }
      }
    }
  });

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

    if(I.airborne) {
      effect.extend({
        getTransform: GameObject.velocityGetTransform(effectI),
        before: {
          update: function() {
            if(effectI.y >= CANVAS_HEIGHT - Floor.LEVEL) {
              effectI.y = CANVAS_HEIGHT - Floor.LEVEL;
              effectI.yVelocity = 0;
            } else {
              effectI.yVelocity += GRAVITY / 2;
            }
          }
        }
      });
    }

    addGameObject(effect);
  });

  self.extend(Biteable(I));
  self.extend(Burnable(I));
  self.extend(Stateful(I));

  self.draw = function(canvas) {
    var self = this;

    canvas.withTransform(self.getTransform(), function() {
      if (I.currentState.sprite() && I.currentState.sprite() !== Sprite.EMPTY) {
        I.currentState.sprite().draw(canvas, -I.currentState.sprite().width/2, -I.currentState.sprite().height/2);
      } else {
        console.log("no soldier sprite")
      }
    });

    canvas.withTransform(self.getTransform(), function() {
      if (I.airborne) {
        parachuteSprite.draw(canvas, -I.currentState.sprite().width/2, -I.currentState.sprite().height/2 - 30);
      }
    });

    if (GameObject.DEBUG_HIT) {
      self.drawHitCircles(canvas);
    }
  }

  return self;
}
