// ECMAScript 5 strict mode
"use strict";

assert2(cr, "cr namespace not created");
assert2(cr.behaviors, "cr.behaviors not created");

/////////////////////////////////////
// Behavior class
// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
//           vvvvvvvvvv
cr.behaviors.CQearthquake = function(runtime)
{
	this.runtime = runtime;
};

(function ()
{
	// *** CHANGE THE BEHAVIOR ID HERE *** - must match the "id" property in edittime.js
	//                               vvvvvvvvvv
	var behaviorProto = cr.behaviors.CQearthquake.prototype;
		
	/////////////////////////////////////
	// Behavior type class
	behaviorProto.Type = function(behavior, objtype)
	{
		this.behavior = behavior;
		this.objtype = objtype;
		this.runtime = behavior.runtime;
	};
	
	var behtypeProto = behaviorProto.Type.prototype;

	behtypeProto.onCreate = function()
	{
	};

	/////////////////////////////////////
	// Behavior instance class
	behaviorProto.Instance = function(type, inst)
	{
		this.type = type;
		this.behavior = type.behavior;
		this.inst = inst;				// associated object instance to modify
		this.runtime = type.runtime;
	};
	
	var behinstProto = behaviorProto.Instance.prototype;

	behinstProto.onCreate = function()
	{
		//constants
		this.EXPANSION_TIME = 1; //secs		
		this.EXTRA_TIME_AT_MAX_SIZE = 1; //secs		
		this.INITIAL_HEIGHT = CQ.TILE_HEIGHT/2;
		this.FINAL_HEIGHT = CQ.EARTHQUAKE_FINAL_HEIGHT_IN_TILES * CQ.TILE_HEIGHT;
		this.NUM_FRAMES = this.inst.type.animations[0].frames.length - 1; //ignore last frame
		this.SECONDS_PER_FRAME = this.EXPANSION_TIME / this.NUM_FRAMES;
		this.DYING_TIME = 1; //secs
	
		//declarations
		this.inst.alreadyCollidedWith = [];
		this.expansionTime = 0;
		this.dying = false;
		this.dyingTime = 0;
		this.inst.OnDestroy = function() { }
	};

	behinstProto.tick = function ()
	{
		var dt = this.runtime.getDt(this.inst);
		
		if (this.dying){
			this.dyingTime += dt;
			if (this.dyingTime >= this.DYING_TIME){
				this.inst.OnDestroy();
				this.runtime.DestroyInstance(this.inst);
				return;
			}			
			var ratio = this.dyingTime / this.DYING_TIME;
			this.inst.opacity = 1 - ratio;
		} else {		
			this.expansionTime += dt;
			if (this.expansionTime >= (this.EXPANSION_TIME + this.EXTRA_TIME_AT_MAX_SIZE)){
				this.dying = true;
				this.inst.collisionsEnabled = false;
				this.inst.changeAnimFrame = this.NUM_FRAMES;
				this.inst.doChangeAnimFrame();
				return;
			} else if (this.expansionTime >= this.EXPANSION_TIME){
				this.inst.changeAnimFrame = this.NUM_FRAMES - 1;
				this.inst.doChangeAnimFrame();
				return;
			}
			
			var currentFrame = Math.floor(this.expansionTime / this.SECONDS_PER_FRAME);
			this.inst.changeAnimFrame = currentFrame;
			this.inst.doChangeAnimFrame();
			
			var ratio = this.expansionTime / this.EXPANSION_TIME;
			var desiredHeight = this.INITIAL_HEIGHT * (1-ratio) + this.FINAL_HEIGHT * ratio; //linear interp
			var desiredScale = desiredHeight / this.inst.cur_animation.frames[currentFrame].height;
			this.setScale(this.inst, desiredScale);
		}
	};
	
	behinstProto.setScale = function (inst, scale)
	{			
		//stolen from Sprite.SetScale()
		var cur_frame = this.inst.curFrame;
		var mirror_factor = (this.inst.width < 0 ? -1 : 1);
		var flip_factor = (this.inst.height < 0 ? -1 : 1);
		var new_width = cur_frame.width * scale * mirror_factor;
		var new_height = cur_frame.height * scale * flip_factor;		
		if (this.inst.width !== new_width || this.inst.height !== new_height)
		{
			this.inst.width = new_width;
			this.inst.height = new_height;
			this.inst.set_bbox_changed();
		}		
	};

	//////////////////////////////////////
	// Conditions
	function Cnds() {};

	// the example condition
	Cnds.prototype.IsMoving = function ()
	{
		// ... see other behaviors for example implementations ...
		return false;
	};
	
	// ... other conditions here ...
	
	behaviorProto.cnds = new Cnds();

	//////////////////////////////////////
	// Actions
	function Acts() {};

	// the example action
	Acts.prototype.CreateTangentObject = function (obj)
	{			
		var sol = this.type.objtype.getCurrentSol();
		var quake1 = sol.instances[0];
		var quake2 = sol.instances[1];
		
		var otherQuake = (quake1 === this.inst) ? quake2 : quake1;
		if (this.inst.alreadyCollidedWith.indexOf(otherQuake) >= 0)
			return; //already created obj with this earthquake
		this.inst.alreadyCollidedWith.push(otherQuake);
		otherQuake.alreadyCollidedWith.push(this.inst);
		
		var dy = quake2.y - quake1.y;
		var dx = quake2.x - quake1.x;
		var dist = Math.sqrt(dx * dx + dy * dy);
		var unitVectorY = dy/dist;
		var unitVectorX = dx/dist;
		var collisionY = quake1.y + (unitVectorY * (quake1.height / 2));
		var collisionX = quake1.x + (unitVectorX * (quake1.width / 2));
		var dToCollisionY = collisionY - quake1.y;
		var dToCollisionX = collisionX - quake1.x;
		var distToCollision = Math.sqrt(dToCollisionX * dToCollisionX + dToCollisionY * dToCollisionY);
		if (distToCollision < dist){ //circle not within another			
			var tangentObj = this.runtime.createInstance(obj, this.runtime.running_layout.layers[CQ.LAYER_TOP], collisionX, collisionY);
			var angle = Math.atan2(dy, dx);
			tangentObj.angle = angle;
			
			CQ.setFaultIndicator(tangentObj);
		}
	};
	
	// ... other actions here ...
	
	behaviorProto.acts = new Acts();

	//////////////////////////////////////
	// Expressions
	function Exps() {};

	// the example expression
	Exps.prototype.MyExpression = function (ret)	// 'ret' must always be the first parameter - always return the expression's result through it!
	{
		ret.set_int(1337);				// return our value
		// ret.set_float(0.5);			// for returning floats
		// ret.set_string("Hello");		// for ef_return_string
		// ret.set_any("woo");			// for ef_return_any, accepts either a number or string
	};
	
	// ... other expressions here ...
	
	behaviorProto.exps = new Exps();
	
}());