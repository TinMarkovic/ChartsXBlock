"""XBlock displaying different kinds of Charts to the end user. """

import pkg_resources

from xblock.core import XBlock  # pylint: disable=import-error
from xblock.fields import Scope, String  # pylint: disable=import-error
from xblock.fragment import Fragment  # pylint: disable=import-error
from django.template import Context, Template  # pylint: disable=import-error


class ChartsXBlock(XBlock):
    """
    XBlock displaying different kinds of Charts to the end user.
    """
    chart_types = ('Pie', 'Line', 'Column', 'Area', 'Scatter', 'Bar')
    chart_data = String(
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
    chart_type = String(
        default='Pie',
        scope=Scope.content,
        help="String holding the type of the chart",
    )
    chart_name = String(
        default='Worker salaries overview',
        scope=Scope.content,
        help="String holding the name of the chart",
    )

    @staticmethod
    def resource_string(path):
        """Handy helper for getting resources from our kit."""
        data = pkg_resources.resource_string(__name__, path)
        return data.decode("utf8")

    def student_view(self, context=None):  # pylint: disable=unused-argument
        """Base method to show the XBlock to the student."""
        html = self.resource_string("static/html/chartsxblock.html")
        frag = Fragment(html.format(self=self))
        frag.add_css(self.resource_string("static/css/chartsxblock.css"))
        frag.add_javascript(self.resource_string("static/vendor/GCloader.js"))
        frag.add_javascript(self.resource_string("static/js/src/chartsxblock.js"))
        frag.initialize_js('ChartsXBlock', {'chartData': self.chart_data,
                                            'chartType': self.chart_type,
                                            'chartName': self.chart_name,
                                            'chartTypes': self.chart_types})
        return frag

    def studio_view(self, context=None):  # pylint: disable=unused-argument
        """Base method to show the XBlock to the editor, in studio."""
        # Using the Django templating engine on the fragment
        non_rendered_html = self.resource_string("static/html/chartsxblock-studio.html")
        template = Template(non_rendered_html)
        rendered_html = template.render(Context({'self': self}))
        frag = Fragment(rendered_html)

        frag.add_css(self.resource_string("static/css/chartsxblock.css"))
        frag.add_javascript(self.resource_string("static/js/src/chartsxblock-studio.js"))
        frag.initialize_js('ChartsXBlockStudio', {'chartData': self.chart_data,
                                                  'chartType': self.chart_type,
                                                  'chartName': self.chart_name,
                                                  'chartTypes': self.chart_types})
        return frag

    @XBlock.json_handler
    def edit_data(self, data, suffix=''):  # pylint: disable=unused-argument
        """Method saving the sent data to the XBlock database."""
        self.chart_name = data["name"].strip(" ")
        self.chart_type = data["type"]
        self.chart_data = data["data"].strip(" ")
        return True
