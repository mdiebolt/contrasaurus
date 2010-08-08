function ProgressBar(I) {
  function completeness() {
    return I.value / I.max;
  }

  function update() {
    I.element.css({
      'background-color': I.colorMap(completeness()),
      'width': Math.floor(completeness() * 100) + "%"
    });
  }

  // Init Defaults
  I = $.extend({
    colorMap: function() {
      return I.color;
    },
    vertical: false,
    element: $("#health")
  }, I);
  
  var self = {
    value: function(newValue) {
      if(newValue != undefined) {
        I.value = Math.min(newValue, I.max);
        update();
        return self;
      } else {
        return I.value;
      }
    }
  };
  
  return self;
}

function GameText(text, I) {
  I.y -= 30;
  I.width = 1;
  I.height = 1;

  return GameObject(I).extend({
    draw: function(canvas) {
      canvas.fillColor("#000");
      canvas.fillText(text, I.x, I.y);
    },

    after: {
      update: function() {
        if(I.age > 30) {
          I.active = false;
        }
      }
    }
  });
}

function healthColorMap(completeness) {
  var r = Math.floor(Math.clamp(1.5 - 2 * completeness, 0, 1) * 255).toString(16);
  if(r.length == 1) {
    r = "0" + r;
  }

  var g = Math.floor(Math.clamp(completeness * 0.75, 0, 1) * 255).toString(16);
  if(g.length == 1) {
    g = "0" + g;
  }

  return "#" + r + g + "00";
}

function DialogBox(text, I) {
  I = I || {};

  return {
    draw: function(canvas) {
      var yPosition = I.yPosition || Math.floor((canvas.height() * 2) / 3);
      var height = I.height || Math.ceil(canvas.height() / 3);
      var lineHeight = I.lineHeight || 16;
      var textAlign = I.textAlign;
      var margin = 16;
      var avatarMargin = margin;
      var width = canvas.width()
      
      if (textAlign) {
        canvas.textAlign(textAlign);
      }
      canvas.fillColor("rgba(0, 0, 0, 0.75)");
      canvas.fillRect(0, yPosition, width, height);

      if(I.avatar) {
        I.avatar.draw(canvas, margin, yPosition);
        avatarMargin += 72 + margin;
      }

      canvas.fillColor("#FFF");
      canvas.fillWrappedText(text, avatarMargin, yPosition + lineHeight, width - avatarMargin - margin);
    },

    update: $.noop
  }
}
