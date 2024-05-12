#ifndef WIDGETOPENGLDRAW_H
#define WIDGETOPENGLDRAW_H
#include <QOpenGLWidget>
#include <QOpenGLFunctions_3_3_Core>

class WidgetOpenGLDraw : public QOpenGLWidget{
public:
	WidgetOpenGLDraw(QWidget* parent);

	~WidgetOpenGLDraw();
    void NarediNekajDodajZelenoBarvo();
private:
	void PrevediSencilnike();
	void printProgramInfoLog(GLuint obj);
	void printShaderInfoLog(GLuint obj);

    QOpenGLFunctions_3_3_Core* gl;
	unsigned int id_sencilni_program;

    unsigned int id_buffer_kocke;
    GLuint id_VAO_kocke;
    unsigned int id_buffer_tla;
    GLuint id_VAO_tla;


    float dodajZelenoBarvo=0;
protected:

	void paintGL() override;
	void initializeGL() override;
	void resizeGL(int w, int h) override;
signals:

public slots:

};

#endif // WIDGETOPENGLDRAW_H
