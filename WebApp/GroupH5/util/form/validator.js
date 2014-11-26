/**
 * @description 表单验证器模块，与Field共同使用
 * @author xuweichen@ctrip.com
 * @date 2014-07-31
 * @example
 * <code>
 *     var validator = new Validator();
 *     validator.addField(new Field(options));
 *     validator.check();
 * </code>
 */
define(['libs'], function () {
	var mix = $.extend;

	/**
	 * 验证器模块
	 * @param options
	 * @constructor
	 */
	function Validator(options) {
		var self = this,
			DEFAULT_OPTIONS = {
				/**
				 * @type {Boolean} 是否强制检查没一项，默认检查到一项失败，则不检查剩下规则
				 */
				forceCheckAll: false
			};

		self.options = mix(DEFAULT_OPTIONS, options || {});
		self._fields = [];
		// self.initialize();
	}

	Validator.prototype = {
		constructor: Validator,
		/**
		 * 添加一个字段
		 * @param field
		 * @returns {Validator}
		 */
		addField: function (field) {
			var self = this;
			self._fields.push(field);
			//return self._fields.length-1;
			return self;
		},
		/**
		 * 删除一个字段
		 * @param {int|Field} index validator中对应的字段索引或字段
		 * @returns {boolean|*}
		 */
		removeField: function (index) {
			var fields = this._fields;
			index = typeof index == 'number' ? index : fields.indexOf(index);

			return (index > -1 && index < fields.length) && (fields.splice(index, 1))[0].destroy();
		},
        removeAllFields: function() {
            while (this._fields.length) {
                this._fields.pop().destroy();
            }
        },
		/**
		 * 执行验证，返回field字段的rule检查结果
		 * @returns {boolean}
		 */
		validate: function () {
			var fields = this._fields,
				l = fields.length,
				result = 1,
				force = this.options.forceCheckAll,
				i = 0;

			if (l) {
				for (; i < l; i++) {
					result &= fields[i].check();
					if (!result && !force) {
						break;
					}
				}
			}

			return !!result;
		}
	};
	return Validator;
});