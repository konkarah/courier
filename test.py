class Triangle:
    def __init__(self, base, height):
        self.base = base
        self.height = height

    def calculate_area(self):
        area = 0.5 * self.base * self.height
        return area

# Example usage
base_length = 5
height_length = 8

triangle = Triangle(base_length, height_length)
myarea = triangle.calculate_area()

print('Area of the triangle:', myarea)
