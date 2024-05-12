#include <iostream>
#include <glm/glm.hpp>
#include <QtMath>

using std::cout, std::cin, std::endl;
using glm::vec3;

void printVec4(glm::vec4 vec){
    cout<<endl<<vec.x<<" "<<vec.y<<" "<<vec.z<<" "<<vec.q<<endl;
}

void prvaEnacba(int n){
    glm::vec4 vector(0.5f, 0.7f, 0.9f, 1.0f);
    glm::mat4 matrix( //Shranjene v stolpcih! (Vsak vektor en stolpec)
        glm::vec4(qCos(qDegreesToRadians(30)),0,0,0),
        glm::vec4(0,1,qSin(qDegreesToRadians(30)),0),
        glm::vec4(0,-qSin(qDegreesToRadians(30)),qCos(qDegreesToRadians(30)),0),
        glm::vec4(0,0,0,1)
        );

    vector *= n;

    glm::vec4 result = vector * matrix;
    printVec4(result);
    return;
}

void drugaEnacba(int n){
    glm::vec4 vec1(2*n,4*n,8*n,16*n);

    glm::vec4 vec2(n*n*n,n*n,n,1);
    //glm::vec4 vec2(1,n,n*n,n*n*n);


    glm::mat4 mat1(
        glm::vec4(0),
        glm::vec4(0),
        glm::vec4(0),
        glm::vec4(0)
        );

    for (int a = 1; a <= n*n*n*n; ++a) {
        mat1 += glm::mat4(
            glm::vec4(0.5f,0,0,0),
            glm::vec4(0,a,0,0),
            glm::vec4(a,0,a*a,0),
            glm::vec4(0,0,0,1)
            );
    }

    glm::mat4 mat3(
        glm::vec4(1,0,0,0),
        glm::vec4(0,1,0,0),
        glm::vec4(0,0,1,0),
        glm::vec4(0,0,0,1)
        );

    for (int a = 1; a <= n; ++a) {
        mat3 *= glm::mat4(
            glm::vec4(0,0,0,0),
            glm::vec4(a,a,0,a),
            glm::vec4(0,0,a*a,0),
            glm::vec4(0,0,0,a*a*a)
            );
    }

    glm::mat4 mat2(
        glm::vec4(0),
        glm::vec4(0),
        glm::vec4(0),
        glm::vec4(0)
        );

    for (int a = 1; a <= n*n; ++a) {
        mat2 += glm::inverse(glm::mat4(
                                 glm::vec4(1,0,0,0),
                                 glm::vec4(0,a,0,0),
                                 glm::vec4(a,a*a*a*a,a*a,0),
                                 glm::vec4(0,0,0,1)
                     ));
    }

    auto result = glm::dot((vec1 * mat1), ((mat2 + mat3) * vec2));

    cout<<endl<<result<<endl;
}

int main(int argc, char *argv[])
{
    int a = 0;

    cout << "Vnesi vrednost za n: ";
    cin >> a;

    cout<<endl<<"Vrednost a: "<<a<<endl;

    prvaEnacba(a);

    drugaEnacba(a);

    return 0;
}
