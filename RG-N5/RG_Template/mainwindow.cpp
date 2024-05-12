#include "mainwindow.h"
#include "ui_mainwindow.h"
#include <QMessageBox>

MainWindow::MainWindow(QWidget *parent) : QMainWindow(parent), ui(new Ui::MainWindow){
	ui->setupUi(this);

    ui->spinBox->setMinimum(0);
    ui->spinBox->setMaximum(0);
}

MainWindow::~MainWindow(){
    delete ui;
}

void MainWindow::on_pushButtonFile_clicked()
{
    ui->widget->OpenFile();
}


void MainWindow::on_pushButton_clicked()
{
    ui->spinBox->setMaximum(ui->spinBox->maximum()+1);
    //ui->spinBox->setValue(ui->spinBox->maximum());
    //ui->widget->ChangeObjectId(ui->spinBox->maximum());
    ui->widget->Load();
}


void MainWindow::on_spinBox_valueChanged(int arg1)
{
    ui->widget->ChangeObjectId(arg1);
}

