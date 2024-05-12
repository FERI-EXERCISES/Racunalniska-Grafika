#include "widgetopengldraw.h"
#include <iostream>
#include <glm/glm.hpp>
#include <glm/ext.hpp>
#include "objloader.hpp"
#include <QOpenGLFunctions_3_3_Core>
#include <QtGlobal>
#if QT_VERSION >= 0x060000
#include <QOpenGLVersionFunctionsFactory>
#endif

#include <QApplication>
#include <QFileDialog>
#include <QKeyEvent>

WidgetOpenGLDraw::WidgetOpenGLDraw(QWidget *parent) : QOpenGLWidget(parent) {
    setFocusPolicy(Qt::StrongFocus);
}

WidgetOpenGLDraw::~WidgetOpenGLDraw() {
	//počisti stanje
    for (int var = 0; var < Objekti.size(); ++var) {

        gl->glDeleteVertexArrays(1,&Objekti[var].id_buffer_obj);
        gl->glDeleteProgram(id_sencilni_program);
    }
    /*
    gl->glDeleteVertexArrays(1,&id_VAO_trikotnik);
    gl->glDeleteProgram(id_sencilni_program);
    */
}


void WidgetOpenGLDraw::printProgramInfoLog(GLuint obj) {
    int infologLength = 0;
    gl->glGetProgramiv(obj, GL_INFO_LOG_LENGTH, &infologLength);
    if (infologLength > 0) {
        std::unique_ptr<char[]> infoLog(new char[infologLength]);
        int charsWritten = 0;
        gl->glGetProgramInfoLog(obj, infologLength, &charsWritten, infoLog.get());
        std::cerr << infoLog.get() << "\n";
    }
}

void WidgetOpenGLDraw::printShaderInfoLog(GLuint obj) {
    int infologLength = 0;
    gl->glGetShaderiv(obj, GL_INFO_LOG_LENGTH, &infologLength);
    if (infologLength > 0) {
		std::unique_ptr<char[]> infoLog(new char[infologLength]);
		int charsWritten = 0;
        gl->glGetShaderInfoLog(obj, infologLength, &charsWritten, infoLog.get());
		std::cerr << infoLog.get() << "\n";
	}
}

void WidgetOpenGLDraw::PrevediSencilnike() {
    id_sencilni_program = gl->glCreateProgram();

	{  // vhod v senčilnik oglišč je in_Pos, izhod pa gl_Position (rezervirana beseda)
        GLuint vs = gl->glCreateShader(GL_VERTEX_SHADER);

        std::string vss;      // priporočamo hrambo spodnjega niza v datoteki (vsencilnik.vert), potem dobite barvanje sintakse in autocomplete
        vss += " #version 330	                                 \n";
        vss += " layout(location=0) in vec3 in_Pos;	             \n";
		vss += " uniform mat4 PVM;						         \n";
		vss += " out vec3 gPos;						             \n";
        vss += " void main(){						             \n";
        vss += "    gl_Position=PVM*vec4(in_Pos.xyz,1);          \n";
        vss += "    gPos=vec3(PVM * vec4(in_Pos, 1.0));          \n";
        vss += " }                                               \n";

		std::cout << vss;
		const char *vssc = vss.c_str();
        gl->glShaderSource(vs, 1, &vssc, nullptr);
        gl->glCompileShader(vs);
		printShaderInfoLog(vs);
        gl->glAttachShader(id_sencilni_program, vs);
	}

	{  // out_Color je barva, ki bo prišla do zaslona
        GLuint fs = gl->glCreateShader(GL_FRAGMENT_SHADER);
        std::string fss;  // priporočamo hrambo spodnjega niza v datoteki (fsencilnik.frag), potem dobite barvanje sintakse in autocomplete
        fss += " #version 330                   	                \n";
        fss += " out vec4 out_Color;                                \n";
        fss += " in vec3 gPos;                  		            \n";
        fss += " uniform vec4 DodajBarvo;                           \n";
        fss += " void main(){                                       \n";
        fss += "    out_Color=vec4(gPos.x,gPos.y ,0,1)+DodajBarvo;  \n";
        fss += " }                                                  \n";
		std::cout << fss;
		const char *fssc = fss.c_str();
        gl->glShaderSource(fs, 1, &fssc, nullptr);
        gl->glCompileShader(fs);
		printShaderInfoLog(fs);
        gl->glAttachShader(id_sencilni_program, fs);
	}

    gl->glLinkProgram(id_sencilni_program);
	printProgramInfoLog(id_sencilni_program);
}

//glm::int32_t velikost = 0;

void WidgetOpenGLDraw::initializeGL() {
	// naložimo funkcije za OpenGL
    std::cout << "OpenGL context version: "<< context()->format().majorVersion() <<"." <<context()->format().minorVersion()<<std::endl;

    //  ali uporabljate najnovejši QT6 ali 5
    #if QT_VERSION >= 0x060000
        gl=QOpenGLVersionFunctionsFactory::get<QOpenGLFunctions_3_3_Core>(context());
    #else
        gl=context()->versionFunctions<QOpenGLFunctions_3_3_Core>();
    #endif
    if (!gl) {
        std::cerr << "Could not obtain required OpenGL context version";
        QApplication::exit(1);
    }

    std::cout << gl->glGetString(GL_VENDOR) << std::endl;
    std::cout << gl->glGetString(GL_VERSION) << std::endl;
    std::cout << gl->glGetString(GL_RENDERER) << std::endl;

	PrevediSencilnike();

    gl->glEnable(GL_DEPTH_TEST);		//v primeru, da rišemo več prekrivajočih
	// trikotnikov, želimo, da sprednje ne prekrijejo tisti, ki bi morali biti
	// odzadaj
    gl->glDisable(GL_CULL_FACE);

	// dejansko nosi lastnosti povezane z buffer (npr. stanje od
	// glEnableVertexAttribArray itd)
	// uporabno predvsem za večjo hitrost

    Objekti.push_back(obj());

    gl->glGenVertexArrays(1, &Objekti[0].id_VAO_obj);
    gl->glBindVertexArray(Objekti[0].id_VAO_obj);

    gl->glGenBuffers(1, &Objekti[0].id_buffer_obj);
    gl->glBindBuffer(GL_ARRAY_BUFFER, Objekti[0].id_buffer_obj);

    std::vector<glm::vec3> out_vertices;
    std::vector<glm::vec2> out_uvs;
    std::vector<glm::vec3> out_normals;

    loadOBJ("C:/Qt/Projects/RG-N5/Models/vaja2_mon.obj", out_vertices, out_uvs, out_normals);
    Objekti[0].velikost = out_vertices.size();

    //gl->glBufferData(GL_ARRAY_BUFFER, sizeof(glm::vec3) * 3, trikotnik, GL_STATIC_DRAW);
    gl->glBufferData(GL_ARRAY_BUFFER, sizeof(glm::vec3) * Objekti[0].velikost, &out_vertices[0], GL_STATIC_DRAW);

    gl->glEnableVertexAttribArray(0);  // uporabjamo: layout(location=0) in vec3 in_Pos;
    gl->glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(glm::vec3), nullptr);

    /*
    gl->glGenVertexArrays(1, &id_VAO_trikotnik);
    gl->glBindVertexArray(id_VAO_trikotnik);

    gl->glGenBuffers(1, &id_buffer_trikotnik);
    gl->glBindBuffer(GL_ARRAY_BUFFER, id_buffer_trikotnik);

    std::vector<glm::vec3> out_vertices;
    std::vector<glm::vec2> out_uvs;
    std::vector<glm::vec3> out_normals;

    loadOBJ("C:/Qt/Projects/RG-N5/Models/vaja2_mon.obj", out_vertices, out_uvs, out_normals);
    velikost = out_vertices.size();

    //gl->glBufferData(GL_ARRAY_BUFFER, sizeof(glm::vec3) * 3, trikotnik, GL_STATIC_DRAW);
    gl->glBufferData(GL_ARRAY_BUFFER, sizeof(glm::vec3) * velikost, &out_vertices[0], GL_STATIC_DRAW);

    gl->glEnableVertexAttribArray(0);  // uporabjamo: layout(location=0) in vec3 in_Pos;
    gl->glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(glm::vec3), nullptr);
    */

    const unsigned int err = gl->glGetError();
	if (err != 0) {
		std::cerr << "OpenGL init napaka: " << err << std::endl;
	}
}

void WidgetOpenGLDraw::resizeGL(int w, int h) {
    gl->glViewport(0, 0, w, h);
}

void WidgetOpenGLDraw::paintGL() {
	// počisti ozadje in globinski pomnilnik (za testiranje globine)
    gl->glClearColor(0.2f, 0.2f, 0.2f, 1);
    gl->glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    for (int var = 0; var < Objekti.size(); ++var) {
        gl->glBindVertexArray(Objekti[var].id_VAO_obj);
        gl->glUseProgram(id_sencilni_program);

        // Projekcija
        glm::mat4 P = glm::perspective(glm::radians(60.0f), float(width()) / height(), 0.01f, 10.0f);

        // Pogled (View)
        glm::mat4 V = glm::mat4(1);
        V = glm::translate(V, glm::vec3(0, 0.3, -3));

        // Model
        glm::mat4 M = glm::mat4(1);
        M = glm::translate(M, glm::vec3(Objekti[var].moveX, Objekti[var].moveY, Objekti[var].moveZ));
        M = glm::rotate_slow(M, glm::radians(float(Objekti[var].rotX)), glm::vec3(1, 0, 0));
        M = glm::rotate_slow(M, glm::radians(float(Objekti[var].rotY)), glm::vec3(0, 1, 0));
        M = glm::scale_slow(M, glm::vec3(Objekti[var].zoomScale, Objekti[var].zoomScale, Objekti[var].zoomScale));

        glm::mat4 PVM = P * V * M;
        //podamo barvo v obliki RGBA! v senčilniku fragmentov jo prištejemo!
        gl->glUniform4f(gl->glGetUniformLocation(id_sencilni_program, "DodajBarvo"), 1, 0, 1, 1);
        gl->glUniformMatrix4fv(gl->glGetUniformLocation(id_sencilni_program, "PVM"), 1, GL_FALSE, glm::value_ptr(PVM));
        gl->glDrawArrays(GL_TRIANGLES, 0, Objekti[var].velikost);

        //gl->glBindVertexArray(0);
    }

    /*
    gl->glBindVertexArray(id_VAO_trikotnik);
    gl->glUseProgram(id_sencilni_program);

    // Projekcija
    glm::mat4 P = glm::perspective(glm::radians(60.0f), float(width()) / height(), 0.01f, 1000.0f);

    // Pogled (View)
    glm::mat4 V = glm::mat4(1);
    V = glm::translate(V, glm::vec3(0, 0.3, -3));

    // Model
    glm::mat4 M = glm::mat4(1);
    M = glm::translate(M, glm::vec3(moveX, moveY, moveZ));
    M = glm::rotate_slow(M, glm::radians(float(rotX)), glm::vec3(1, 0, 0));
    M = glm::rotate_slow(M, glm::radians(float(rotY)), glm::vec3(0, 1, 0));
    M = glm::scale_slow(M, glm::vec3(zoomScale, zoomScale, zoomScale));

    glm::mat4 PVM = P * V * M;
    //podamo barvo v obliki RGBA! v senčilniku fragmentov jo prištejemo!
    gl->glUniform4f(gl->glGetUniformLocation(id_sencilni_program, "DodajBarvo"), 1, 0, 1, 1);
    gl->glUniformMatrix4fv(gl->glGetUniformLocation(id_sencilni_program, "PVM"), 1, GL_FALSE, glm::value_ptr(PVM));
    gl->glDrawArrays(GL_TRIANGLES, 0, velikost);
    */

    const unsigned int err = gl->glGetError();
	if (err != 0) {
		std::cerr << "OpenGL napaka: " << err << std::endl;
    }
}

void WidgetOpenGLDraw::OpenFile() {
    filePath = QFileDialog::getOpenFileName(this, tr("Open OBJ File"), "C:/Qt/Projects/RG-N5/Models", tr("OBJ Files (*.obj)"));
    std::cout<<filePath.toStdString().c_str()<<std::endl;
}

void WidgetOpenGLDraw::Load() {
    std::vector<glm::vec3> out_vertices;
    std::vector<glm::vec2> out_uvs;
    std::vector<glm::vec3> out_normals;

    std::cout<<filePath.toStdString().c_str()<<std::endl;

    //obj New;
    Objekti.push_back(obj());

    makeCurrent();

    gl->glGenVertexArrays(1, &Objekti.back().id_VAO_obj);
    gl->glGenBuffers(1, &Objekti.back().id_buffer_obj);

    gl->glBindVertexArray(Objekti.back().id_VAO_obj);
    gl->glBindBuffer(GL_ARRAY_BUFFER, Objekti.back().id_buffer_obj);

    loadOBJ(filePath.toStdString().c_str(), out_vertices, out_uvs, out_normals);
    Objekti.back().velikost = out_vertices.size();

    // Update the buffer data
    gl->glBufferData(GL_ARRAY_BUFFER, sizeof(glm::vec3) * Objekti.back().velikost, &out_vertices[0], GL_STATIC_DRAW);

    gl->glEnableVertexAttribArray(0);
    gl->glVertexAttribPointer(0, 3, GL_FLOAT, GL_FALSE, sizeof(glm::vec3), nullptr);

    // Unbind the VAO
    gl->glBindVertexArray(0);

    update();
}

void WidgetOpenGLDraw::keyPressEvent(QKeyEvent *event) {
    switch (event->key()) {
    case Qt::Key_Up:
        Objekti[CurrentObj].rotX -= 1;
        break;
    case Qt::Key_Down:
        Objekti[CurrentObj].rotX += 1;
        break;
    case Qt::Key_Left:
        Objekti[CurrentObj].rotY -= 1;
        break;
    case Qt::Key_Right:
        Objekti[CurrentObj].rotY += 1;
        break;

    case Qt::Key_Q:
        Objekti[CurrentObj].moveY += 0.1f;
        break;
    case Qt::Key_E:
        Objekti[CurrentObj].moveY -= 0.1f;
        break;

    case Qt::Key_W:
        Objekti[CurrentObj].moveZ += 0.1f;
        break;
    case Qt::Key_S:
        Objekti[CurrentObj].moveZ -= 0.1f;
        break;
    case Qt::Key_A:
        Objekti[CurrentObj].moveX += 0.1f;
        break;
    case Qt::Key_D:
        Objekti[CurrentObj].moveX -= 0.1f;
        break;

    default:
        event->ignore();
        return;
    }
    update();
}

void WidgetOpenGLDraw::wheelEvent(QWheelEvent *event) {
    int delta = event->angleDelta().y();

    if (delta > 0) {
        Objekti[CurrentObj].zoomScale *= 1.1;
    } else if (delta < 0) {
        Objekti[CurrentObj].zoomScale *= 0.9;
    }

    update();
}

void WidgetOpenGLDraw::ChangeObjectId(int id) {
    if(id > Objekti.size()-1)
        CurrentObj = Objekti.size()-1;
    else if(id < 0)
        CurrentObj = 0;
    else
        CurrentObj = id;
}

