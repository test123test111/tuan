/**
 * @description field模块
 * @author xuweichen@ctrip.com
 * @date 2014-07-31
 */
define(['libs'], function () {
	var mix = $.extend;

	function Field(options) {
		var self = this,
			NULL = null,
			NOOP = function () { };

		self.options = {
			/**
			 * @type {ZeptoDOM} 需要验证的input对象
			 */
			dom: NULL,
			/**
			 * @required
			 * @type {Array|Function|RegExp} 需要检查的规则
			 */
			rules: NULL,
			/**
			 * @required
			 * @type {Event} 检查完回调
			 */
			onCheck: NOOP,
			/**
			 * @type {Boolean} 是否必填
			 */
			required: true,
			/**
			 * @type {String} 触发检查的事件类型
			 */
			triggerEvent: ''
		}

		self.options = mix(self.options, options || {});
		self.dom = self.options.dom;
		self.initialize();
	}

	Field.prototype = {
		initialize: function () {
			var self = this,
				triggerEvent = self.options.triggerEvent,
				dom = self.dom;

			self.required = self.options.required;
			if (!(dom && dom[0])) return;
			self.__blurHandler = function () {
				self.check();
			};
			triggerEvent && dom.on(triggerEvent, self.__blurHandler);
		},
		constructor: Field,
		/**
		 * 执行当前字段检查
		 * @returns {number|boolean}
		 */
		check: function () {
			var dom = this.dom,
				val = dom && dom.val() || '',
				options = this.options,
				rules = options.rules,
				result = 1,
				i = 0,
				rule,
				required = this.required,
				l,
				isFunction = $.isFunction;

			!Array.isArray(rules) && (rules = [rules]);
			l = rules.length;
			for (; i < l; i++) {
				rule = rules[i];
				//如果非必填，略过
				if (!required && !val) continue;
				if (!(result &= (isFunction(rule) ? rule(val) : rule.test(val)))) break;
			}
			;
			options.onCheck.call(this, !!result, { val: val, dom: dom, rule: i });
			return result || !required;
		},
		/**
		 * 销毁当前Field对象
		 * @returns {boolean}
		 */
		destroy: function () {
			var self = this,
				dom = self.dom;

			dom && dom.off(self.options.triggerEvent, self.__blurHandler);
			return true;
		}
	}
	return Field;
});