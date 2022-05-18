import { Request, Response } from "express"
import CreateCourseService from "./CreateCourseService"

export function createCourse(request: Request, response: Response) {
  CreateCourseService.execute({
    name: "NodeJS",
    duration: 10,
    educator: "Vitória"
  })

  CreateCourseService.execute({
    name: "ReactJS",
    educator: "Vitória"
  })
  return response.send()
}