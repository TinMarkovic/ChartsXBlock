"""XBlock displaying different kinds of Charts to the end user. """

import pkg_resources

from xblock.core import XBlock
from xblock.fields import Scope, String
from xblock.fragment import Fragment
from django.template import Context, Template


class ChartsXBlock(XBlock):
    """
    XBlock displaying different kinds of Charts to the end user.
    """
    chartTypes = ('Pie', 'Line', 'Column', 'Area', 'Scatter', 'Bar')
    chartData = String(
        default='''[
[
"Employee Name",
"Salary"
],
[
"Alice",
42000
],
[
"Bob",
35000
],
[
"Christine",
44000
],
[
"Dan",
27000
],
[
"Ella",
92000
],
[
"Fritz",
18500
]
]''',
        scope=Scope.content,
        help="String holding the data for the chart",
    )
    chartType = String(
        default='Pie',
        scope=Scope.content,
        help="String holding the type of the chart",
    )
    chartName = String(
        default='Worker salaries overview',
        scope=Scope.content,
        help="String holding the name of the chart",
    )

    def resource_string(self, path):
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def student_view(self, context=None):
        html = self.resource_string("static/html/chartsxblock.html")
        frag = Fragment(html.format(self=self))
        frag.add_css(self.resource_string("static/css/chartsxblock.css"))
        frag.add_javascript(self.resource_string("static/vendor/GCloader.js"))
        frag.add_javascript(self.resource_string("static/js/src/chartsxblock.js"))
        frag.initialize_js('ChartsXBlock', {'chartData': self.chartData,
                                            'chartType': self.chartType,
                                            'chartName': self.chartName})
        return frag

    def studio_view(self, context=None):
        # Using the Django templating engine on the fragment
        non_rendered_html = self.resource_string("static/html/chartsxblock-studio.html")
        template = Template(non_rendered_html)
        rendered_html = template.render(Context({'self': self}))
        frag = Fragment(rendered_html)

        frag.add_css(self.resource_string("static/css/chartsxblock.css"))
        frag.add_javascript(self.resource_string("static/js/src/chartsxblock-studio.js"))
        frag.initialize_js('ChartsXBlockStudio', {'chartData': self.chartData,
                                                  'chartType': self.chartType,
                                                  'chartName': self.chartName})
        return frag

    @XBlock.json_handler
    def edit_data(self, data, suffix=''):
        self.chartName = data["name"].strip(" ")
        self.chartType = data["type"]
        self.chartData = data["data"].strip(" ")
        return True
