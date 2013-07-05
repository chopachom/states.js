(function () {
	Object.augment = function (constructor, augmentingFunction) {
		if (!augmentingFunction) {
			augmentingFunction = constructor;
			constructor = undefined;
		}
		// Support both Object.augment(Constructor, ...) and Constructor.augment(...)
		// so if ctor isn't passed, we assume that we're called as property of the constructor
		var supr = this.prototype || constructor.prototype;
		var prototype = Object.create(supr);
        constructor = augmentingFunction.call(prototype, this || constructor, supr);

        if (!constructor && prototype.constructor) {
            constructor = prototype.constructor;
        }

		constructor || (constructor = function () {});
		prototype.constructor = constructor;
		constructor.prototype = prototype;
		constructor.augment = Object.augment;
		return constructor;
	};
})();