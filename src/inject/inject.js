function initExtension() {
	console.log('init bois')
	var elements
	var ELEMENT_COLUMN_CLASS = '._ce_f1'
	var ELEMENT_NAV_BUTTON_CLASS = '._ce_Q1'
	var days = [[]]
	var injectedElements = []
	var currentDay = { val: null, index: 0 }
	var changeListener

	function injectHours(elements) {
		var totalHeight = $(ELEMENT_COLUMN_CLASS).context.clientHeight;

		var dayWidth
		elements.each(function(i, e) {
			console.log('loopdiboop', elements.length, i)
			var element = $(e)
			if (!dayWidth) {
				dayWidth = element.context.parentElement.clientWidth / 5
				currentDay.val = dayWidth
			}

			var text = element.context.innerText

			if (text.search(/:|;/i) !== -1) {
				var projectName = text.slice(0, text.search(/:|;/i))
				if (projectName.indexOf('http') !== -1) {
					return
				}
				var work = {
					element: element,
					hours: Math.round((element.context.clientHeight / 53) * 2) / 2,
					text: text,
					project: projectName
				}

				if (element.context.offsetLeft > currentDay.val) {
					currentDay.val += dayWidth
					currentDay.index++
					days[currentDay.index] = [ work ]
				} else {
					days[currentDay.index].push(work)
				}
				element.append('<p class="injected-hour">' + work.hours + '</p>')
			}
		})

		var summaries = days.map(function (day) {
			var summary = { total: 0 }
			day.forEach(function (work, i) {
				summary.total += work.hours
				if (summary[work.project]) {
					summary[work.project] += work.hours
				} else {
					summary[work.project] = work.hours
				}
				if (i === day.length - 1) {
					summary.lastElement = work.element
				}
			})
			return summary
		})
		console.log(summaries)

		injectedElements = summaries.map(function(summary, i) {
			console.log(summary)
			var elementContext = summary.lastElement.context
			var injectedElement = $('<div/>', {
				class: 'day-summary day-' + i,
				text: 'Total: ' + summary.total
			})
			.css('width', '100%')
			.css('top', totalHeight + 'px')
			injectedElement.appendTo(summary.lastElement)
			return injectedElement
		})
	}

	function findElementsAndInject() {
		injectedElements.forEach(function(element) {
			element.remove()
			element = null
		})
		elements = []
		days = [[]]
		injectedElements = []
		currentDay = { val: null, index: 0 }
		var findItems = setInterval(function() {
			var elements = $(ELEMENT_COLUMN_CLASS);

			if (elements.length > 0) {
				clearInterval(findItems)
				injectHours(elements)

				if (!changeListener) {
					changeListener = $(ELEMENT_NAV_BUTTON_CLASS).click(function() {
						findElementsAndInject()
					})
				}
			}
		}, 2000)
	}

	findElementsAndInject()
}

chrome.extension.sendMessage({}, function() {
	var readyStateCheckInterval = setInterval(function() {
		if (document.readyState === "complete") {
			clearInterval(readyStateCheckInterval)

			initExtension()
		}
	}, 10)
});
