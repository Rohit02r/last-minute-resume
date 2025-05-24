import { Button, Col, Input, Modal, Row, Tooltip } from "antd";
import TextArea from "antd/es/input/TextArea";
import html2pdf from "html2pdf.js";
import { useEffect, useRef, useState } from "react";
import { FaDownload, FaPlus } from "react-icons/fa6";
import { IoPersonCircle, IoPersonSharp } from "react-icons/io5";
import { useMediaQuery } from "react-responsive";
import axios from "axios";
import { MdDesktopWindows } from "react-icons/md";
import { API_URL } from "../config";

const AUTO_SAVE_DELAY = 2000;

interface EducationEntry {
  collegeName: string;
  degreeName: string;
  percentage: string;
  completedYear: string;
}
interface Certification {
  certificationName: string;
  provider: string;
}
interface Project {
  projectName: string;
  projectExplanation: string;
}
interface Acheivement {
  achievementName: string;
  achievementExplanation: string;
}

const ResumePart = () => {
  const isMobile = useMediaQuery({ query: "(max-width: 550px)" });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [isGuest, setIsGuest] = useState(false);
  const [islogout, setIsLogout] = useState(false);
  const [entryModal, setEntryModal] = useState(false);
  const [skillsNo, setSkillsNo] = useState<any[]>([""]);

  const [user, setUser] = useState({
    name: "",
    photo: "",
    loginId: "",
  });
  const [languagesNo, setLanguagesNo] = useState<any[]>([""]);
  const [hobbiesNo, setHobbiesNo] = useState<any[]>([""]);
  const [sskillsNo, setSSkillsNo] = useState<any[]>([""]);
  const [certificationNo, setCertificationNo] = useState<any[]>([
    {
      certificationName: "",
      provider: "",
    },
  ]);
  const [acheivementNo, setAcheivementNo] = useState<any[]>([
    {
      achievementName: "",
      achievementExplanation: "",
    },
  ]);
  const [projectNo, setProjectNo] = useState<any[]>([
    {
      projectName: "",
      projectExplanation: "",
    },
  ]);
  const [edNo, setEdNo] = useState<EducationEntry[]>([
    {
      collegeName: "",
      degreeName: "",
      percentage: "",
      completedYear: "",
    },
  ]);
  const [values, setValues] = useState({
    name: "",

    summary: "",
  });
  const [contactEntries, setContactEntries] = useState([{ contact: "" }]);

  const [hasPosted, setHasPosted] = useState(false);
  const [formData, setFormData] = useState({
    user: {
      name: "",
      photo: "",
      loginId: "",
    },
    values: {
      name: "",
      summary: "",
    },
    skillsNo: [""],
    languagesNo: [""],
    hobbiesNo: [""],
    sskillsNo: [""],
    certificationNo: [{ certificationName: "", provider: "" }],
    acheivementNo: [{ achievementName: "", achievementExplanation: "" }],
    projectNo: [{ projectName: "", projectExplanation: "" }],
    edNo: [
      {
        collegeName: "",
        degreeName: "",
        percentage: "",
        completedYear: "",
      },
    ],
    contactEntries: [{ contact: "" }],
  });
  useEffect(() => {
    axios
      .get(`${API_URL}/me`, { withCredentials: true })
      .then((res) => {
        const loginId = res.data.loginId;
        setFormData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            loginId,
            displayName: res.data.displayName,
            email: res.data.email,
          },
        }));

        return axios.get(`${API_URL}/api/resume/${loginId}`, {
          withCredentials: true,
        });
      })
      .then((res) => {
        setFormData(res.data);
        setHasPosted(true);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setHasPosted(false);
        } else {
          console.error("Error fetching resume:", err);
        }
      });
  }, []);

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      user,
      values,
      skillsNo,
      languagesNo,
      hobbiesNo,
      sskillsNo,
      certificationNo,
      acheivementNo,
      projectNo,
      edNo,
      contactEntries,
    }));
  }, [
    user,
    values,
    skillsNo,
    languagesNo,
    hobbiesNo,
    sskillsNo,
    certificationNo,
    acheivementNo,
    projectNo,
    edNo,
    contactEntries,
  ]);

  useEffect(() => {
    if (isGuest) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const url = hasPosted
        ? `${API_URL}/api/resume/${formData.user.loginId}`
        : `${API_URL}/api/resume`;

      const method = hasPosted ? "patch" : "post";

      axios[method](url, formData, {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => {
          console.log("Auto-saved!", res.data);
          if (!hasPosted) setHasPosted(true);
        })
        .catch((err) => {
          console.error("Auto-save failed", err);
        });
    }, AUTO_SAVE_DELAY);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [formData]);

  const handleContactChange = (
    index: number,
    field: keyof (typeof contactEntries)[number],
    value: string
  ) => {
    const updated = [...contactEntries];
    updated[index][field] = value;
    setContactEntries(updated);
  };

  const handleAddMoreContact = () => {
    setContactEntries([...contactEntries, { contact: "" }]);
  };

  const divRef = useRef<HTMLDivElement>(null);
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/assets/sample resume.pdf";
    link.download = "myfile.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (divRef.current) {
      const element = divRef.current;
      const opt = {
        margin: 0.1,
        filename: `${formData.values.name} Resume.pdf`,
        image: { type: "jpeg", quality: 1 },
        html2canvas: {
          scale: 2,
          useCORS: true,
        },
        jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      };

      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .catch((err: any) => console.error("Error generating PDF:", err));
    }
  };

  const handleAddmoreSkill = () => {
    setSkillsNo([...skillsNo, ""]);
  };
  const handleAddmoreLang = () => {
    setLanguagesNo([...languagesNo, ""]);
  };
  const handleAddmoreHob = () => {
    setHobbiesNo([...hobbiesNo, ""]);
  };
  const handleAddmoreSSkill = () => {
    setSSkillsNo([...sskillsNo, ""]);
  };
  const handleAddmoreAch = () => {
    setAcheivementNo([
      ...acheivementNo,
      {
        achievementName: "",
        achievementExplanation: "",
      },
    ]);
  };
  const handleAddmoreProject = () => {
    setProjectNo([...projectNo, { projectName: "", projectExplanation: "" }]);
  };
  const handleAddmoreCert = () => {
    setCertificationNo([
      ...certificationNo,
      {
        certificationName: "",
        provider: "",
      },
    ]);
  };
  const handleAddmoreEd = () => {
    setEdNo([
      ...edNo,
      { collegeName: "", degreeName: "", percentage: "", completedYear: "" },
    ]);
  };

  const handleSkillChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newSkills = [...skillsNo];
    newSkills[index] = e.target.value;
    setSkillsNo(newSkills);
  };
  const handleLanguagesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newSkills = [...languagesNo];
    newSkills[index] = e.target.value;
    setLanguagesNo(newSkills);
  };
  const handleHobbiesChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newSkills = [...hobbiesNo];
    newSkills[index] = e.target.value;
    setHobbiesNo(newSkills);
  };
  const handleEdChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: keyof EducationEntry
  ) => {
    const newEd = [...edNo];
    newEd[index][field] = e.target.value;
    setEdNo(newEd);
  };

  const handleSSkillChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newSkills = [...sskillsNo];
    newSkills[index] = e.target.value;
    setSSkillsNo(newSkills);
  };
  const handleCertificationChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: keyof Certification
  ) => {
    const newCert = [...certificationNo];
    newCert[index][field] = e.target.value;
    setCertificationNo(newCert);
  };
  const handleProjectChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: keyof Project
  ) => {
    const newCert = [...projectNo];
    newCert[index][field] = e.target.value;
    setProjectNo(newCert);
  };
  const handleAcheivementChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    index: number,
    field: keyof Acheivement
  ) => {
    const newCert = [...acheivementNo];
    newCert[index][field] = e.target.value;
    setAcheivementNo(newCert);
  };
  const originalConsoleError = console.error;
  console.error = (...args) => {
    if (
      args[0] &&
      args[0].includes(
        "ResumePart.tsx?t=1748080728398:316 Encountered two children with the same key, `0`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version."
      )
    ) {
      return;
    }
    originalConsoleError(...args);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get(`${API_URL}/me`, {
          withCredentials: true,
        });
        const user = userRes.data;

        const updatedForm = {
          ...formData,
          user: {
            ...formData.user,
            loginId: user.loginId,
            displayName: user.displayName,
            email: user.email,
          },
        };
        setFormData(updatedForm);

        try {
          const resumeRes = await axios.get(
            `${API_URL}/api/resume/${user.loginId}`,
            {
              withCredentials: true,
            }
          );
          const existingResume = resumeRes.data;

          setFormData(existingResume);
        } catch (resumeErr: any) {
          if (resumeErr.response?.status === 404) {
            const newResumeRes = await axios.post(
              `${API_URL}/api/resume`,
              updatedForm,
              { withCredentials: true }
            );
            setFormData(newResumeRes.data);
          } else {
            console.error("Error fetching resume:", resumeErr);
          }
        }
      } catch (err) {
        console.error("Error loading user or resume:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    axios
      .get(`${API_URL}/me`, {
        withCredentials: true,
      })
      .then((res) => {
        const user = res.data;
        setFormData((prev) => ({
          ...prev,
          user: {
            ...prev.user,
            loginId: user.loginId,
            displayName: user.displayName,
            email: user.email,
          },
        }));

        return axios.get(`${API_URL}/api/resume/${user.loginId}`, {
          withCredentials: true,
        });
      })
      .then((resumeRes) => {
        const existingResume = resumeRes.data;
        setFormData(existingResume);
      })
      .catch((err) => {
        console.log("Error loading user or resume:", err);
      });
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_URL}/me`, {
          withCredentials: true,
        });

        const data = res.data;

        if (data?.displayName) {
          setUser({
            name: data.displayName,
            photo: data.photo,
            loginId: data.loginId,
          });
          setEntryModal(false);
        } else {
          setEntryModal(true);
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setEntryModal(true); 
      }
    };

    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await axios.get(`${API_URL}/logout`, {
        withCredentials: true,
      });

      if (res.status === 200) {
        setUser({ name: "", photo: "", loginId: "" });
        setIsLogout(false);
        setEntryModal(true);
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <>
      {isMobile ? (
        <div className="notice-container">
          <MdDesktopWindows className="notice-icon" />
          <h2 className="notice-title">
            Please switch to a <span>desktop view</span>
          </h2>
          <p className="notice-text">
            This feature is best experienced on a larger screen. Try resizing
            your browser or using a desktop device.
          </p>
        </div>
      ) : (
        <div>
          <div className="nav px-5 py-2 glass-effect">
            <div>
              <p className="tit">Last Minute Resume</p>
            </div>
            <div className="d-flex">
              <Button onClick={handleDownload} className="me-3">
                Sample Resume <FaDownload />
              </Button>
              <Tooltip placement="bottom" title={"Download your Resume"}>
                <Button className="me-3">
                  <FaDownload onClick={handleExportPDF} />
                </Button>
              </Tooltip>
              <Tooltip placement="bottom" title={"Logout ?"}>
                {user.photo ? (
                  <div
                    onClick={() => setIsLogout(true)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={user.photo}
                      style={{
                        height: "30px",
                        width: "30px",
                        borderRadius: "50%",
                      }}
                    />
                  </div>
                ) : (
                  ""
                )}
              </Tooltip>
            </div>
          </div>
          <div>
            <Row className="w-box text-center">
              <Col span={16}>
                <div className="pap-box pt-5">
                  <div className="pap text-center">
                    <div className="res-cont " ref={divRef}>
                      <header className="resume-header">
                        <p className="name pt-1 mb-0 text-center">
                          {formData.values.name}
                        </p>
                        <div
                          className="contact d-flex justify-content-center align-items-center flex-wrap"
                          style={{
                            minHeight: "50px",
                            textAlign: "center",
                            gap: "5px",
                          }}
                        >
                          {formData.contactEntries
                            .map((entry) => entry.contact)
                            .filter((val) => val.trim() !== "")
                            .map((val, index, arr) => (
                              <span key={index} className="c-txt">
                                {val}
                                {index < arr.length - 1 && (
                                  <span className="px-1 c-txt">|</span>
                                )}
                              </span>
                            ))}
                        </div>
                      </header>

                      <section className="resume-section mb-2">
                        {formData.values.summary ? (
                          <>
                            <p className="section-title ps-3 mb-0">Summary</p>
                            <div className="mx-3 ln mb-1"></div>
                          </>
                        ) : (
                          ""
                        )}

                        <p className="overview-txt px-3  mb-1">
                          {formData.values.summary}
                        </p>
                      </section>
                      <section className="resume-section mb-2">
                        {formData.skillsNo.filter((skill) => skill.trim())
                          .length > 0 ? (
                          <>
                            <p className="section-title ps-3 mb-0">Skills</p>
                            <div className="mx-3 ln"></div>
                            <ul className="skills-list mb-0 mt-1">
                              {formData.skillsNo.map((val, index) => (
                                <li key={index} className="sub-title-clg">
                                  {val}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                      </section>
                      <section className="resume-section mb-2">
                        {formData.sskillsNo.filter((skill) => skill.trim())
                          .length > 0 ? (
                          <>
                            <p className="section-title ps-3 mb-0">
                              Soft Skills
                            </p>
                            <div className="mx-3 ln"></div>
                            <ul className="skills-list mb-0 mt-1">
                              {formData.sskillsNo.map((val, index) => (
                                <li key={index} className="sub-title-clg">
                                  {val}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                      </section>
                      <section className="resume-section mb-2">
                        {formData.edNo.some(
                          (ed) =>
                            ed.collegeName.trim() ||
                            ed.degreeName.trim() ||
                            ed.percentage.trim() ||
                            ed.completedYear.trim()
                        ) ? (
                          <>
                            <p className="section-title ps-3 mb-0">Education</p>
                            <div className="mx-3 ln "></div>
                            {formData.edNo.map((val, index) => (
                              <div className="education-item px-3" key={index}>
                                <div>
                                  <div className=" text-start ">
                                    <span className="sub-title-clg">
                                      {val.collegeName}
                                    </span>
                                  </div>
                                  <div
                                    className="d-flex justify-content-between"
                                    style={{ width: "50%", maxWidth: "70%" }}
                                  >
                                    <span className="sub-title">
                                      {val.degreeName}
                                    </span>
                                    <div
                                      style={{
                                        maxWidth: "300px",
                                        width: "250px",
                                      }}
                                    >
                                      <span className="sub-title">
                                        {" "}
                                        <b>{val.percentage}</b>
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <span className="sub-title-clg">
                                    {val.completedYear}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </>
                        ) : null}
                      </section>

                      <section className="resume-section mb-2">
                        {formData.projectNo.some(
                          (cert) =>
                            cert.projectName?.trim() ||
                            cert.projectExplanation?.trim()
                        ) ? (
                          <>
                            <p className="section-title ps-3 mb-0">Projects</p>
                            <div className="mx-3 ln mb-1"></div>
                            <ul className="skills-list mb-0">
                              <li>
                                {formData.projectNo.map((val, index) => (
                                  <div className=" me-3" key={index}>
                                    <div className="me-3 ">
                                      <span className="sub-title-clg">
                                        <b>{val.projectName}</b>
                                      </span>
                                    </div>
                                    <div className="">
                                      <span className="sub-title ">
                                        {" "}
                                        {val.projectExplanation}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </li>
                            </ul>
                          </>
                        ) : null}
                      </section>
                      <section className="resume-section mb-2">
                        {formData.certificationNo.some(
                          (cert) =>
                            cert.provider?.trim() ||
                            cert.certificationName?.trim()
                        ) ? (
                          <>
                            <p className="section-title ps-3 mb-0">
                              Certifications
                            </p>
                            <div className="mx-3 ln mb-1"></div>
                            <ul className="skills-list mb-0">
                              <li>
                                {formData.certificationNo.map((val, index) => (
                                  <div className="d-flex me-3" key={index}>
                                    <div className="me-3 ">
                                      <span className="sub-title-clg">
                                        {val.certificationName}
                                      </span>
                                    </div>
                                    <div className="">
                                      <span className="sub-title ">
                                        {" "}
                                        - {val.provider}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </li>
                            </ul>
                          </>
                        ) : null}
                      </section>
                      <section className="resume-section mb-2">
                        {formData.acheivementNo.some(
                          (cert) =>
                            cert.achievementName?.trim() ||
                            cert.achievementExplanation?.trim()
                        ) ? (
                          <>
                            <p className="section-title ps-3 mb-0">
                              Acheivements
                            </p>
                            <div className="mx-3 ln mb-1"></div>
                            <ul className="skills-list mb-0">
                              <li>
                                {formData.acheivementNo.map((val, index) => (
                                  <div className=" me-3" key={index}>
                                    <div className="me-3 ">
                                      <span className="sub-title-clg">
                                        <b>{val.achievementName}</b>
                                      </span>
                                    </div>
                                    <div className="">
                                      <span className="sub-title ">
                                        {" "}
                                        {val.achievementExplanation}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </li>
                            </ul>
                          </>
                        ) : null}
                      </section>
                      <section className="resume-section mb-2">
                        {formData.languagesNo.filter(
                          (lang) => lang.trim().length > 0
                        ).length > 0 ? (
                          <>
                            <p className="section-title ps-3 mb-0">Languages</p>
                            <div className="mx-3 ln mb-1"></div>
                            <ul className="skills-list mb-0 mt-1">
                              {formData.languagesNo
                                .filter((val) => val.trim().length > 0)
                                .map((val, index) => (
                                  <li key={index}>
                                    <span className="sub-title-clg">{val}</span>
                                  </li>
                                ))}
                            </ul>
                          </>
                        ) : null}
                      </section>
                      <section className="resume-section mb-2">
                        {formData.hobbiesNo.filter(
                          (lang) => lang.trim().length > 0
                        ).length > 0 ? (
                          <>
                            <p className="section-title ps-3 mb-0">Hobbies</p>
                            <div className="mx-3 ln mb-1"></div>
                            <ul className="skills-list mb-0 mt-1">
                              {formData.hobbiesNo
                                .filter((val) => val.trim().length > 0)
                                .map((val, index) => (
                                  <li key={index}>
                                    <span className="sub-title-clg">{val}</span>
                                  </li>
                                ))}
                            </ul>
                          </>
                        ) : null}
                      </section>
                    </div>
                  </div>
                </div>
              </Col>

              <Col span={8}>
                <div className="inp-box">
                  <h3 className="px-4 py-2">Enter Your Data Here</h3>
                  <div className="px-4 inp-d mx-2 text-start my-2">
                    <label className="labl ">Name</label>
                    <br />
                    <Input
                      placeholder="eg: Rohit R"
                      value={formData.values.name}
                      onChange={(e) =>
                        setValues({ ...values, name: e.target.value })
                      }
                    ></Input>
                  </div>
                  <div className="px-4 inp-d mx-2 text-start my-2">
                    <label className="labl">Enter Contact Details</label>
                    {formData.contactEntries.map((entry, index) => (
                      <Row gutter={32} key={index} className="mb-3">
                        <Col span={24}>
                          <Input
                            placeholder="eg: chennai | 9876543210 | xyz@gmail.com"
                            value={entry.contact}
                            onChange={(e) =>
                              handleContactChange(
                                index,
                                "contact",
                                e.target.value
                              )
                            }
                          />
                        </Col>
                      </Row>
                    ))}

                    <Button icon={<FaPlus />} onClick={handleAddMoreContact}>
                      Add More
                    </Button>
                  </div>
                  <div className="px-4 inp-d mx-2 text-start my-2">
                    <label className="labl ">Summary</label>
                    <br />
                    <TextArea
                      placeholder="Passionate fullstack Developer"
                      rows={4}
                      maxLength={260}
                      value={formData.values.summary}
                      onChange={(e) =>
                        setValues({ ...values, summary: e.target.value })
                      }
                    ></TextArea>
                  </div>
                  <div className="px-4 inp-d mx-2 text-start my-2">
                    <label className="labl">Skills</label>
                    <br />
                    {formData.skillsNo.map((val, index) => (
                      <Input
                        className="my-2"
                        key={index}
                        value={val}
                        onChange={(e) => handleSkillChange(e, index)}
                        placeholder="eg: Java ,Python"
                      />
                    ))}

                    <Button
                      icon={<FaPlus />}
                      className="mt-3"
                      onClick={handleAddmoreSkill}
                    >
                      Add more
                    </Button>
                  </div>
                  <div className="px-4 inp-d mx-2 text-start my-2">
                    <label className="labl">Soft Skills</label>
                    <br />
                    {formData.sskillsNo.map((val, index) => (
                      <Input
                        className="my-2"
                        key={index}
                        value={val}
                        onChange={(e) => handleSSkillChange(e, index)}
                        placeholder="Quick learner, Hard Worker"
                      />
                    ))}

                    <Button
                      icon={<FaPlus />}
                      className="mt-3"
                      onClick={handleAddmoreSSkill}
                    >
                      Add more
                    </Button>
                  </div>
                  <div className="px-4 inp-d mx-2 text-start mb-2 mt-4">
                    <label className="labl">Education</label>
                    <br />
                    {formData.edNo.map((val, index) => (
                      <Row gutter={32} key={index}>
                        <Col span={24}>
                          <label className="labl-s">College Name</label>
                          <Input
                            className="my-2"
                            value={val.collegeName}
                            onChange={(e) =>
                              handleEdChange(e, index, "collegeName")
                            }
                            placeholder="eg: xyz college"
                          />
                        </Col>
                        <Col span={24}>
                          <label className="labl-s">Degree Name</label>
                          <Input
                            className="my-2"
                            value={val.degreeName}
                            onChange={(e) =>
                              handleEdChange(e, index, "degreeName")
                            }
                            placeholder="eg: B.E"
                          />
                        </Col>
                        <Col span={12}>
                          <label className="labl-s">Percentage</label>
                          <Input
                            className="my-2"
                            value={val.percentage}
                            onChange={(e) =>
                              handleEdChange(e, index, "percentage")
                            }
                            placeholder="88% / 8.2 CGPA"
                          />
                        </Col>
                        <Col span={12}>
                          <label className="labl-s">Completed Year</label>
                          <Input
                            className="my-2"
                            value={val.completedYear}
                            onChange={(e) =>
                              handleEdChange(e, index, "completedYear")
                            }
                            placeholder="eg: May 2025"
                          />
                        </Col>
                      </Row>
                    ))}

                    <Button
                      icon={<FaPlus />}
                      className="mt-3"
                      onClick={handleAddmoreEd}
                    >
                      Add more
                    </Button>
                  </div>
                  <div className="px-4 inp-d mx-2 text-start my-2">
                    <label className="labl">Projects</label>
                    <br />
                    {formData.projectNo.map((val, index) => (
                      <>
                        <label className="labl-s">Project Name</label>

                        <Input
                          className="my-1"
                          key={index}
                          value={val.projectName}
                          onChange={(e) =>
                            handleProjectChange(e, index, "projectName")
                          }
                          placeholder="eg: Mini E-commerce Website"
                        />
                        <label className="labl-s">Explanation</label>

                        <TextArea
                          rows={4}
                          className="my-1"
                          key={index}
                          maxLength={260}
                          value={val.projectExplanation}
                          onChange={(e) =>
                            handleProjectChange(e, index, "projectExplanation")
                          }
                          placeholder="Made a e-com website with html, css,..."
                        />
                      </>
                    ))}

                    <Button
                      icon={<FaPlus />}
                      className="mt-3"
                      onClick={handleAddmoreProject}
                    >
                      Add more
                    </Button>
                  </div>
                  <div className="px-4 inp-d mx-2 text-start my-2">
                    <label className="labl">Certifications</label>
                    <br />
                    {formData.certificationNo.map((val, index) => (
                      <>
                        <label className="labl-s">Certification Name</label>

                        <Input
                          className="my-1"
                          key={index}
                          value={val.certificationName}
                          onChange={(e) =>
                            handleCertificationChange(
                              e,
                              index,
                              "certificationName"
                            )
                          }
                          placeholder="eg: IBM Fullstack Course"
                        />
                        <label className="labl-s">Provider</label>

                        <Input
                          className="my-1"
                          key={index}
                          value={val.provider}
                          onChange={(e) =>
                            handleCertificationChange(e, index, "provider")
                          }
                          placeholder="Coursera"
                        />
                      </>
                    ))}

                    <Button
                      icon={<FaPlus />}
                      className="mt-3"
                      onClick={handleAddmoreCert}
                    >
                      Add more
                    </Button>
                  </div>
                  <div className="px-4 inp-d mx-2 text-start my-2">
                    <label className="labl">Acheivements</label>
                    <br />
                    {formData.acheivementNo.map((val, index) => (
                      <>
                        <label className="labl-s">Acheivement Name</label>

                        <Input
                         
                          className="my-1"
                          key={index}
                          value={val.achievementName}
                          onChange={(e) =>
                            handleAcheivementChange(e, index, "achievementName")
                          }
                          placeholder="eg: Event Volunteer"
                        />
                        <label className="labl-s">
                          Acheivement Explanation
                        </label>

                        <TextArea 
                         rows={4}
                          maxLength={260}
                          className="my-1"
                          key={index}
                          value={val.achievementExplanation}
                          onChange={(e) =>
                            handleAcheivementChange(
                              e,
                              index,
                              "achievementExplanation"
                            )
                          }
                          placeholder="Assisted in the smooth execution of the symposium..."
                        />
                      </>
                    ))}

                    <Button
                      icon={<FaPlus />}
                      className="mt-3"
                      onClick={handleAddmoreAch}
                    >
                      Add more
                    </Button>
                  </div>
                  <div className="px-4 inp-d mx-2 text-start my-2">
                    <label className="labl">Languages</label>
                    <br />
                    {formData.languagesNo.map((val, index) => (
                      <Input
                        className="my-2"
                        key={index}
                        value={val}
                        onChange={(e) => handleLanguagesChange(e, index)}
                        placeholder="Tamil , English , French"
                      />
                    ))}

                    <Button
                      icon={<FaPlus />}
                      className="mt-3"
                      onClick={handleAddmoreLang}
                    >
                      Add more
                    </Button>
                  </div>
                  <div className="px-4 inp-d mx-2 text-start my-2">
                    <label className="labl">Hobbies</label>
                    <br />
                    {formData.hobbiesNo.map((val, index) => (
                      <Input
                        className="my-2"
                        key={index}
                        value={val}
                        onChange={(e) => handleHobbiesChange(e, index)}
                        placeholder="Book Reading , Gardening"
                      />
                    ))}

                    <Button
                      icon={<FaPlus />}
                      className="mt-3"
                      onClick={handleAddmoreHob}
                    >
                      Add more
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
          <Modal open={entryModal} footer={null} closable={false} centered>
            <div style={{ textAlign: "center" }}>
              <h2>Welcome!</h2>
              <p>Please choose how you'd like to continue:</p>

              <div className="d-flex justify-content-between">
                <Button
                  icon={<IoPersonSharp fontSize={"20px"} className="pt-1" />}
                  className="me-3"
                  style={{ width: "80%" }}
                  onClick={() => {
                    setEntryModal(false);
                    setIsGuest(true);
                  }}
                >
                  Continue as Guest
                </Button>

                <Button
                  type="default"
                  icon={<IoPersonCircle fontSize={"25px"} className="pt-1" />}
                  style={{ width: "80%" }}
                  onClick={() => {
                    window.location.href = `${API_URL}/auth/google`;
                  }}
                >
                  Login with Google
                </Button>
              </div>
            </div>
          </Modal>
          <Modal
            open={islogout}
            onCancel={() => setIsLogout(false)}
            footer={false}
            title={"Do you want to Logout ?"}
            width={"20%"}
          >
            <div className="text-center mt-4">
              <Button style={{ width: "160px" }} onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </Modal>
        </div>
      )}
    </>
  );
};

export default ResumePart;
