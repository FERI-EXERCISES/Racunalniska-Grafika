#ifndef WIDGETOPENGLDRAW_H
#define WIDGETOPENGLDRAW_H
#include <QOpenGLWidget>
#include <QOpenGLFunctions_3_3_Core>
#include "glm/glm.hpp"

struct obj{
    unsigned int id_buffer_obj;
    GLuint id_VAO_obj;
    glm::int32_t velikost = 0;
    int rotX=0, rotY=0;
    float moveX, moveY, moveZ, zoomScale = 1;
};

class WidgetOpenGLDraw : public QOpenGLWidget{
public:
	WidgetOpenGLDraw(QWidget* parent);

	~WidgetOpenGLDraw();
    void OpenFile();
    void Load();
    void ChangeObjectId(int id);

private:
	void PrevediSencilnike();
	void printProgramInfoLog(GLuint obj);
	void printShaderInfoLog(GLuint obj);

    QOpenGLFunctions_3_3_Core* gl;
	unsigned int id_sencilni_program;
    QString filePath = "";
    int CurrentObj = 0;

    std::vector<obj> Objekti;

    /*
	unsigned int id_buffer_trikotnik;
	GLuint id_VAO_trikotnik;
    int rotX=0, rotY=0;
    float moveX, moveY, moveZ, zoomScale = 1;
    */
protected:

	void paintGL() override;
	void initializeGL() override;
	void resizeGL(int w, int h) override;
    void keyPressEvent(QKeyEvent *event) override;
    void wheelEvent(QWheelEvent *event) override;
signals:

public slots:

};

#endif // WIDGETOPENGLDRAW_H
