"""Setup for chartsxblock XBlock."""

import os
from setuptools import setup


def package_data(pkg, roots):
    """Generic function to find package_data.

    All of the files under each of the `roots` will be declared as package
    data for package `pkg`.

    """
    data = []
    for root in roots:
        for dirname, _, files in os.walk(os.path.join(pkg, root)):
            for fname in files:
                data.append(os.path.relpath(os.path.join(dirname, fname), pkg))

    return {pkg: data}


setup(
    name='chartsxblock-xblock',
    version='1.0.0',
    description='XBlock for Charts',
    license='UNKNOWN',
    packages=[
        'chartsxblock',
    ],
    install_requires=[
        'XBlock',
        'Django'
    ],
    entry_points={
        'xblock.v1': [
            'chartsxblock = chartsxblock:ChartsXBlock',
        ]
    },
    package_data=package_data("chartsxblock", ["static", "public"]),
)
